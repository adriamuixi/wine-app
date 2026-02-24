<?php

declare(strict_types=1);

namespace App\Tests\Integration\Http;

use Doctrine\DBAL\Connection;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\BufferedOutput;
use Symfony\Component\HttpFoundation\Response;

final class AuthControllerWebTest extends WebTestCase
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

        $this->resetUsers();
        $this->seedDemoUser();

        self::ensureKernelShutdown();
    }

    public function testLoginMeLogoutFlow(): void
    {
        $client = static::createClient(['environment' => 'test', 'debug' => true]);

        $client->request('GET', '/api/auth/me');
        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);

        $client->jsonRequest('POST', '/api/auth/login', [
            'email' => 'demo@example.com',
            'password' => 'demo1234',
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_OK);
        self::assertResponseHasHeader('set-cookie');
        $loginPayload = json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        self::assertSame('demo@example.com', $loginPayload['user']['email']);

        $client->request('GET', '/api/auth/me');
        self::assertResponseStatusCodeSame(Response::HTTP_OK);
        $mePayload = json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        self::assertSame('demo@example.com', $mePayload['user']['email']);

        $client->request('POST', '/api/auth/logout');
        self::assertResponseStatusCodeSame(Response::HTTP_NO_CONTENT);

        $client->request('GET', '/api/auth/me');
        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testLoginRejectsInvalidCredentials(): void
    {
        $client = static::createClient(['environment' => 'test', 'debug' => true]);

        $client->jsonRequest('POST', '/api/auth/login', [
            'email' => 'demo@example.com',
            'password' => 'wrong-password',
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
        $payload = json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        self::assertSame('Invalid credentials.', $payload['error']);
    }

    public function testLoginRejectsInvalidBody(): void
    {
        $client = static::createClient(['environment' => 'test', 'debug' => true]);

        $client->request(
            'POST',
            '/api/auth/login',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: '{'
        );

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
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

    private function resetUsers(): void
    {
        $this->connection->executeStatement('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
    }

    private function seedDemoUser(): void
    {
        $this->connection->insert('users', [
            'email' => 'demo@example.com',
            'name' => 'Demo',
            'lastname' => 'User',
            'password_hash' => password_hash('demo1234', PASSWORD_DEFAULT),
            'created_at' => (new \DateTimeImmutable())->format('Y-m-d H:i:sP'),
        ]);
    }
}
