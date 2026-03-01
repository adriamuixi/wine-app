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

final class WineControllerWebTest extends WebTestCase
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

        $this->resetWineTables();
        $this->seedDoAndGrape();

        self::ensureKernelShutdown();
    }

    public function testCreateStoresWineGrapeAndWinePurchaseRows(): void
    {
        $client = static::createClient(['environment' => 'test', 'debug' => true]);

        $client->jsonRequest('POST', '/api/wines', [
            'name' => 'Integration Wine',
            'do_id' => 1,
            'wine_grapes' => [
                [
                    'grape_id' => 1,
                    'percentage' => 100,
                ],
            ],
            'wine_purchase' => [
                [
                    'place' => [
                        'place_type' => 'supermarket',
                        'name' => 'Super Sol',
                        'address' => null,
                        'city' => 'Madrid',
                        'country' => 'spain',
                    ],
                    'price_paid' => '12.50',
                    'purchased_at' => '2026-03-01T10:00:00+00:00',
                ],
            ],
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);

        $payload = json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $wineId = (int) $payload['wine']['id'];

        $grapeCount = (int) $this->connection->fetchOne('SELECT count(*) FROM wine_grape WHERE wine_id = :wine_id', ['wine_id' => $wineId]);
        $purchaseCount = (int) $this->connection->fetchOne('SELECT count(*) FROM wine_purchase WHERE wine_id = :wine_id', ['wine_id' => $wineId]);

        self::assertSame(1, $grapeCount);
        self::assertSame(1, $purchaseCount);
    }

    public function testDeleteRemovesRelatedRowsByCascade(): void
    {
        $client = static::createClient(['environment' => 'test', 'debug' => true]);

        $client->jsonRequest('POST', '/api/wines', [
            'name' => 'Delete Cascade Wine',
            'do_id' => 1,
            'wine_grapes' => [
                ['grape_id' => 1, 'percentage' => 100],
            ],
            'wine_purchase' => [
                [
                    'place' => [
                        'place_type' => 'restaurant',
                        'name' => 'Casa Pepe',
                        'address' => 'Calle 1',
                        'city' => 'Madrid',
                        'country' => 'spain',
                    ],
                    'price_paid' => '18.00',
                    'purchased_at' => '2026-03-01T11:00:00+00:00',
                ],
            ],
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $payload = json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $wineId = (int) $payload['wine']['id'];

        $client->request('DELETE', sprintf('/api/wines/%d', $wineId));
        self::assertResponseStatusCodeSame(Response::HTTP_NO_CONTENT);

        $wineCount = (int) $this->connection->fetchOne('SELECT count(*) FROM wine WHERE id = :id', ['id' => $wineId]);
        $grapeCount = (int) $this->connection->fetchOne('SELECT count(*) FROM wine_grape WHERE wine_id = :wine_id', ['wine_id' => $wineId]);
        $purchaseCount = (int) $this->connection->fetchOne('SELECT count(*) FROM wine_purchase WHERE wine_id = :wine_id', ['wine_id' => $wineId]);

        self::assertSame(0, $wineCount);
        self::assertSame(0, $grapeCount);
        self::assertSame(0, $purchaseCount);
    }

    public function testDeleteRemovesWinePhotosFromDiskAndDirectory(): void
    {
        $client = static::createClient(['environment' => 'test', 'debug' => true]);

        $client->jsonRequest('POST', '/api/wines', [
            'name' => 'Wine With Photo',
            'do_id' => 1,
            'wine_grapes' => [
                ['grape_id' => 1, 'percentage' => 100],
            ],
            'wine_purchase' => [
                [
                    'place' => [
                        'place_type' => 'restaurant',
                        'name' => 'Casa Foto',
                        'address' => 'Calle 9',
                        'city' => 'Madrid',
                        'country' => 'spain',
                    ],
                    'price_paid' => '22.00',
                    'purchased_at' => '2026-03-01T11:00:00+00:00',
                ],
            ],
        ]);
        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $payload = json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $wineId = (int) $payload['wine']['id'];

        $tmp = tempnam(sys_get_temp_dir(), 'wine-delete-photo-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, 'photo-content');
        $file = new UploadedFile($tmp, 'front.jpg', null, null, true);

        $client->request('POST', sprintf('/api/wines/%d/photos', $wineId), ['type' => 'front_label'], ['file' => $file]);
        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $photoPayload = json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $storedPath = '/shared/public'.$photoPayload['photo']['url'];
        self::assertFileExists($storedPath);

        $wineDir = '/shared/public/images/wines/'.$wineId;
        self::assertDirectoryExists($wineDir);

        $client->request('DELETE', sprintf('/api/wines/%d', $wineId));
        self::assertResponseStatusCodeSame(Response::HTTP_NO_CONTENT);

        self::assertFileDoesNotExist($storedPath);
        self::assertDirectoryDoesNotExist($wineDir);
    }

    public function testGetByIdReturnsWineWithAwardsPhotosGrapesAndReviews(): void
    {
        $client = static::createClient(['environment' => 'test', 'debug' => true]);

        $client->jsonRequest('POST', '/api/wines', [
            'name' => 'Detail Wine',
            'do_id' => 1,
            'grapes' => [
                ['grape_id' => 1, 'percentage' => 100],
            ],
            'purchases' => [
                [
                    'place' => [
                        'place_type' => 'restaurant',
                        'name' => 'Casa Detail',
                        'address' => 'Calle 5',
                        'city' => 'Madrid',
                        'country' => 'spain',
                    ],
                    'price_paid' => '20.00',
                    'purchased_at' => '2026-03-01T12:00:00+00:00',
                ],
            ],
        ]);
        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $payload = json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $wineId = (int) $payload['wine']['id'];

        $this->connection->insert('wine_award', [
            'wine_id' => $wineId,
            'name' => 'parker',
            'score' => '95.00',
            'year' => 2025,
        ]);

        $this->connection->insert('wine_photo', [
            'wine_id' => $wineId,
            'url' => '/images/wines/'.$wineId.'/front.jpg',
            'type' => 'front_label',
            'hash' => 'abc123def4567890',
            'size' => 2048,
            'extension' => 'jpg',
        ]);

        $this->connection->insert('users', [
            'email' => 'reviewer@example.com',
            'name' => 'Ana',
            'lastname' => 'Lopez',
            'password_hash' => '$2y$12$dummyhashdummyhashdummyhashdummyhashdummyhashdummyha',
        ]);
        $userId = (int) $this->connection->lastInsertId();

        $this->connection->insert('review', [
            'user_id' => $userId,
            'wine_id' => $wineId,
            'score' => 93,
            'intensity_aroma' => 4,
            'sweetness' => 2,
            'acidity' => 3,
            'tannin' => 2,
            'body' => 4,
            'persistence' => 5,
        ]);
        $reviewId = (int) $this->connection->lastInsertId();

        $this->connection->insert('review_bullets', [
            'review_id' => $reviewId,
            'bullet' => 'fruity',
        ]);

        $client->request('GET', sprintf('/api/wines/%d', $wineId));
        self::assertResponseStatusCodeSame(Response::HTTP_OK);
        $response = json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame('Detail Wine', $response['wine']['name']);
        self::assertSame('parker', $response['wine']['awards'][0]['name']);
        self::assertSame('front_label', $response['wine']['photos'][0]['type']);
        self::assertSame('Tempranillo', $response['wine']['grapes'][0]['name']);
        self::assertSame('Ana', $response['wine']['reviews'][0]['user']['name']);
        self::assertSame('fruity', $response['wine']['reviews'][0]['bullets'][0]);
    }

    public function testUpdateReplacesAwardsInDatabase(): void
    {
        $client = static::createClient(['environment' => 'test', 'debug' => true]);

        $client->jsonRequest('POST', '/api/wines', [
            'name' => 'Update Award Wine',
            'do_id' => 1,
            'grapes' => [
                ['grape_id' => 1, 'percentage' => 100],
            ],
            'purchases' => [
                [
                    'place' => [
                        'place_type' => 'restaurant',
                        'name' => 'Casa Update',
                        'address' => 'Calle 9',
                        'city' => 'Madrid',
                        'country' => 'spain',
                    ],
                    'price_paid' => '25.00',
                    'purchased_at' => '2026-03-01T14:00:00+00:00',
                ],
            ],
            'awards' => [
                ['name' => 'parker', 'score' => 92.5, 'year' => 2025],
            ],
        ]);
        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $payload = json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $wineId = (int) $payload['wine']['id'];

        $client->jsonRequest('PUT', sprintf('/api/wines/%d', $wineId), [
            'name' => 'Update Award Wine v2',
            'awards' => [
                ['name' => 'decanter', 'score' => 95.0, 'year' => 2026],
                ['name' => 'james_suckling', 'score' => null, 'year' => null],
            ],
        ]);
        self::assertResponseStatusCodeSame(Response::HTTP_NO_CONTENT);

        /** @var list<array{name:string,score:?string,year:?int}> $rows */
        $rows = $this->connection->fetchAllAssociative(
            'SELECT name, score::text AS score, year FROM wine_award WHERE wine_id = :wine_id ORDER BY id ASC',
            ['wine_id' => $wineId],
        );
        self::assertCount(2, $rows);
        self::assertSame('decanter', $rows[0]['name']);
        self::assertSame('95.00', $rows[0]['score']);
        self::assertSame(2026, $rows[0]['year']);
        self::assertSame('james_suckling', $rows[1]['name']);
        self::assertNull($rows[1]['score']);
        self::assertNull($rows[1]['year']);

        $client->jsonRequest('PUT', sprintf('/api/wines/%d', $wineId), [
            'awards' => [],
        ]);
        self::assertResponseStatusCodeSame(Response::HTTP_NO_CONTENT);
        $remaining = (int) $this->connection->fetchOne(
            'SELECT count(*) FROM wine_award WHERE wine_id = :wine_id',
            ['wine_id' => $wineId],
        );
        self::assertSame(0, $remaining);
    }

    public function testListUsesDefaultPaginationOfTwentyItems(): void
    {
        for ($i = 1; $i <= 25; ++$i) {
            $this->connection->insert('wine', [
                'name' => sprintf('List Wine %d', $i),
            ]);
        }

        $client = static::createClient(['environment' => 'test', 'debug' => true]);
        $client->request('GET', '/api/wines');

        self::assertResponseStatusCodeSame(Response::HTTP_OK);
        $payload = json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertCount(20, $payload['items']);
        self::assertSame(1, $payload['pagination']['page']);
        self::assertSame(20, $payload['pagination']['limit']);
        self::assertSame(25, $payload['pagination']['total_items']);
        self::assertSame(2, $payload['pagination']['total_pages']);
    }

    public function testListSupportsPageAndLimitQueryParams(): void
    {
        for ($i = 1; $i <= 25; ++$i) {
            $this->connection->insert('wine', [
                'name' => sprintf('Page Wine %d', $i),
            ]);
        }

        $client = static::createClient(['environment' => 'test', 'debug' => true]);
        $client->request('GET', '/api/wines?page=2&limit=10');

        self::assertResponseStatusCodeSame(Response::HTTP_OK);
        $payload = json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertCount(10, $payload['items']);
        self::assertSame(2, $payload['pagination']['page']);
        self::assertSame(10, $payload['pagination']['limit']);
    }

    public function testListSupportsTypeCountryRegionGrapeAndScoreFilters(): void
    {
        $this->connection->executeStatement(
            'INSERT INTO "do" (name, region, country, country_code) VALUES (:name, :region, :country, :country_code)',
            [
                'name' => 'Rioja',
                'region' => 'La Rioja',
                'country' => 'spain',
                'country_code' => 'ES',
            ],
        );
        $doId2 = (int) $this->connection->lastInsertId();

        $this->connection->insert('grape', [
            'name' => 'Garnacha',
            'color' => 'red',
        ]);
        $grapeId2 = (int) $this->connection->lastInsertId();

        $client = static::createClient(['environment' => 'test', 'debug' => true]);
        $client->jsonRequest('POST', '/api/wines', [
            'name' => 'Filtered Winner',
            'wine_type' => 'white',
            'do_id' => $doId2,
            'country' => 'spain',
            'grapes' => [
                ['grape_id' => $grapeId2, 'percentage' => 100],
            ],
            'purchases' => [
                [
                    'place' => [
                        'place_type' => 'restaurant',
                        'name' => 'Casa Filter',
                        'address' => 'Calle 10',
                        'city' => 'Logrono',
                        'country' => 'spain',
                    ],
                    'price_paid' => '30.00',
                    'purchased_at' => '2026-03-01T12:00:00+00:00',
                ],
            ],
        ]);
        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $wineA = (int) json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR)['wine']['id'];

        $client->jsonRequest('POST', '/api/wines', [
            'name' => 'Filtered Loser',
            'wine_type' => 'red',
            'do_id' => 1,
            'country' => 'spain',
            'grapes' => [
                ['grape_id' => 1, 'percentage' => 100],
            ],
            'purchases' => [
                [
                    'place' => [
                        'place_type' => 'restaurant',
                        'name' => 'Casa Other',
                        'address' => 'Calle 11',
                        'city' => 'Madrid',
                        'country' => 'spain',
                    ],
                    'price_paid' => '20.00',
                    'purchased_at' => '2026-03-01T12:00:00+00:00',
                ],
            ],
        ]);
        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $wineB = (int) json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR)['wine']['id'];

        $this->connection->insert('users', [
            'email' => 'filter-reviewer@example.com',
            'name' => 'Filter',
            'lastname' => 'Tester',
            'password_hash' => '$2y$12$dummyhashdummyhashdummyhashdummyhashdummyhashdummyha',
        ]);
        $userId = (int) $this->connection->lastInsertId();

        $this->connection->insert('review', [
            'user_id' => $userId,
            'wine_id' => $wineA,
            'score' => 94,
            'intensity_aroma' => 4,
            'sweetness' => 2,
            'acidity' => 3,
            'tannin' => 1,
            'body' => 4,
            'persistence' => 4,
        ]);

        $this->connection->insert('users', [
            'email' => 'filter-reviewer-2@example.com',
            'name' => 'Filter2',
            'lastname' => 'Tester2',
            'password_hash' => '$2y$12$dummyhashdummyhashdummyhashdummyhashdummyhashdummyha',
        ]);
        $userId2 = (int) $this->connection->lastInsertId();

        $this->connection->insert('review', [
            'user_id' => $userId2,
            'wine_id' => $wineB,
            'score' => 62,
            'intensity_aroma' => 3,
            'sweetness' => 2,
            'acidity' => 3,
            'tannin' => 2,
            'body' => 3,
            'persistence' => 3,
        ]);

        $client->request('GET', sprintf('/api/wines?wine_type=white&country=spain&do_id=%d&grape_id=%d&score_min=90&sort_by=score&sort_dir=desc', $doId2, $grapeId2));
        self::assertResponseStatusCodeSame(Response::HTTP_OK);
        $payload = json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertCount(1, $payload['items']);
        self::assertSame('Filtered Winner', $payload['items'][0]['name']);
        self::assertSame($doId2, $payload['items'][0]['do']['id']);
        self::assertEquals(94.0, $payload['items'][0]['avg_score']);
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

    private function resetWineTables(): void
    {
        $this->connection->executeStatement('TRUNCATE TABLE wine_award, wine_photo, review_bullets, review, wine_grape, wine_purchase, wine, grape, place, users, "do" RESTART IDENTITY CASCADE');
    }

    private function seedDoAndGrape(): void
    {
        $this->connection->executeStatement(
            'INSERT INTO "do" (name, region, country, country_code) VALUES (:name, :region, :country, :country_code)',
            [
                'name' => 'Ribera',
                'region' => 'Castilla y Leon',
                'country' => 'spain',
                'country_code' => 'ES',
            ],
        );

        $this->connection->insert('grape', [
            'name' => 'Tempranillo',
            'color' => 'red',
        ]);
    }
}
