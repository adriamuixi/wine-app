<?php

declare(strict_types=1);

namespace App\Tests\Integration\Http;

use Doctrine\DBAL\Connection;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\BufferedOutput;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Response;

final class WinePhotoControllerWebTest extends WebTestCase
{
    private static bool $databasePrepared = false;

    private Connection $connection;
    protected function setUp(): void
    {
        self::bootKernel(['environment' => 'test', 'debug' => true]);
        self::prepareTestDatabase();

        /** @var ManagerRegistry $doctrine */
        $doctrine = self::getContainer()->get('doctrine');
        /** @var Connection $connection */
        $connection = $doctrine->getConnection();
        $this->connection = $connection;
        $this->resetTables();
        $this->seedWine();

        self::ensureKernelShutdown();
    }

    public function testUploadCreatesWinePhotoRowAndStoresFile(): void
    {
        $client = static::createClient(['environment' => 'test', 'debug' => true]);

        $tmp = tempnam(sys_get_temp_dir(), 'wine-upload-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, 'fake-image-content');
        $file = new UploadedFile($tmp, 'label.jpg', null, null, true);

        $client->request('POST', '/api/wines/1/photos', ['type' => 'front_label'], ['file' => $file]);

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);

        $payload = json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        self::assertSame(1, $payload['photo']['wine_id']);
        self::assertSame('front_label', $payload['photo']['type']);
        self::assertSame(16, strlen((string) $payload['photo']['hash']));

        $photoCount = (int) $this->connection->fetchOne('SELECT count(*) FROM wine_photo WHERE wine_id = 1');
        self::assertSame(1, $photoCount);

        $storedPath = '/shared/public'.$payload['photo']['url'];
        self::assertFileExists($storedPath);
    }

    public function testUploadReplacesExistingPhotoOfSameType(): void
    {
        $client = static::createClient(['environment' => 'test', 'debug' => true]);

        $tmp1 = tempnam(sys_get_temp_dir(), 'wine-upload-');
        self::assertNotFalse($tmp1);
        file_put_contents($tmp1, 'fake-image-content-one');
        $file1 = new UploadedFile($tmp1, 'label1.jpg', null, null, true);

        $client->request('POST', '/api/wines/1/photos', ['type' => 'front_label'], ['file' => $file1]);
        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $payload1 = json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $oldUrl = (string) $payload1['photo']['url'];
        $oldPath = '/shared/public'.$oldUrl;
        self::assertFileExists($oldPath);

        $tmp2 = tempnam(sys_get_temp_dir(), 'wine-upload-');
        self::assertNotFalse($tmp2);
        file_put_contents($tmp2, 'fake-image-content-two');
        $file2 = new UploadedFile($tmp2, 'label2.jpg', null, null, true);

        $client->request('POST', '/api/wines/1/photos', ['type' => 'front_label'], ['file' => $file2]);
        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $payload2 = json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $newUrl = (string) $payload2['photo']['url'];

        self::assertNotSame($oldUrl, $newUrl);
        self::assertFileDoesNotExist($oldPath);
        self::assertFileExists('/shared/public'.$newUrl);

        $photoCount = (int) $this->connection->fetchOne(
            "SELECT count(*) FROM wine_photo WHERE wine_id = 1 AND type = 'front_label'"
        );
        self::assertSame(1, $photoCount);
    }

    private static function prepareTestDatabase(): void
    {
        if (self::$databasePrepared) {
            return;
        }

        $kernel = self::$kernel ?? self::bootKernel(['environment' => 'test', 'debug' => true]);
        $application = new Application($kernel);
        $application->setAutoExit(false);

        self::runConsole($application, [
            'command' => 'doctrine:database:create',
            '--if-not-exists' => true,
            '--env' => 'test',
        ]);

        self::runConsole($application, [
            'command' => 'doctrine:migrations:migrate',
            '--no-interaction' => true,
            '--env' => 'test',
        ]);

        self::$databasePrepared = true;
    }

    /**
     * @param array<string, mixed> $input
     */
    private static function runConsole(Application $application, array $input): void
    {
        $exitCode = $application->run(new ArrayInput($input), new BufferedOutput());
        self::assertSame(0, $exitCode);
    }

    private function resetTables(): void
    {
        $this->connection->executeStatement('TRUNCATE TABLE wine_photo, wine_award, review_bullets, review, wine_grape, wine_purchase, wine, grape, place, "do" RESTART IDENTITY CASCADE');
    }

    private function seedWine(): void
    {
        $this->connection->insert('wine', [
            'name' => 'Photo Test Wine',
            'created_at' => (new \DateTimeImmutable())->format('Y-m-d H:i:sP'),
            'updated_at' => (new \DateTimeImmutable())->format('Y-m-d H:i:sP'),
        ]);
    }
}
