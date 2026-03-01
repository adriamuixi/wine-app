<?php

declare(strict_types=1);

namespace App\Tests\Unit\Adapters\In\Http;

use App\Adapters\In\Http\WineController;
use App\Application\Ports\WinePhotoStoragePort;
use App\Domain\Repository\DoRepository;
use App\Domain\Repository\GrapeRepository;
use App\Domain\Repository\WineRepository;
use App\Domain\Repository\WinePhotoRepository;
use App\Domain\Model\Award;
use App\Domain\Model\Place;
use App\Application\UseCases\Wine\CreateWine\CreateWineCommand;
use App\Application\UseCases\Wine\CreateWine\CreateWineHandler;
use App\Application\UseCases\Wine\DeleteWine\DeleteWineHandler;
use App\Application\UseCases\Wine\GetWine\GetWineDetailsHandler;
use App\Domain\Model\Wine;
use App\Domain\Model\DenominationOfOrigin;
use App\Domain\Model\WineGrape;
use App\Domain\Model\WinePhoto;
use App\Domain\Model\WinePurchase;
use App\Domain\Model\WineReview;
use App\Application\UseCases\Wine\ListWines\ListWinesHandler;
use App\Application\UseCases\Wine\ListWines\ListWinesQuery;
use App\Application\UseCases\Wine\ListWines\ListWinesResult;
use App\Application\UseCases\Wine\ListWines\WineListItemView;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineCommand;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineHandler;
use App\Domain\Enum\AgingType;
use App\Domain\Enum\AwardName;
use App\Domain\Enum\Country;
use App\Domain\Enum\GrapeColor;
use App\Domain\Enum\PlaceType;
use App\Domain\Enum\ReviewBullet;
use App\Domain\Enum\WineType;
use App\Domain\Enum\WinePhotoType;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

final class WineControllerTest extends TestCase
{
    public function testCreateReturnsBadRequestForInvalidJson(): void
    {
        $controller = $this->controller();
        $request = Request::create('/api/wines', 'POST', server: ['CONTENT_TYPE' => 'application/json'], content: '{');

        $response = $controller->create($request);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testCreateReturnsBadRequestWhenNameIsMissing(): void
    {
        $controller = $this->controller();
        $request = Request::create(
            '/api/wines',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['country' => 'spain'], JSON_THROW_ON_ERROR),
        );

        $response = $controller->create($request);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testCreateReturnsNotFoundWhenDoDoesNotExist(): void
    {
        $controller = $this->controller(doCountries: []);
        $request = Request::create(
            '/api/wines',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['name' => 'Mencia', 'do_id' => 999], JSON_THROW_ON_ERROR),
        );

        $response = $controller->create($request);

        self::assertSame(Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testCreateReturnsCreatedWithWineId(): void
    {
        $controller = $this->controller(doCountries: [1 => Country::Spain], grapeIds: [5]);
        $request = Request::create(
            '/api/wines',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'name' => 'Wine 1',
                'do_id' => 1,
                'alcohol_percentage' => 14.5,
                'grapes' => [
                    ['grape_id' => 5, 'percentage' => 100],
                ],
                'purchases' => [
                    [
                        'place' => [
                            'place_type' => 'restaurant',
                            'name' => 'Casa Paco',
                            'address' => 'Calle A',
                            'city' => 'Madrid',
                            'country' => 'spain',
                        ],
                        'price_paid' => '13.50',
                        'purchased_at' => '2026-02-28T09:00:00+00:00',
                    ],
                ],
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->create($request);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_CREATED, $response->getStatusCode());
        self::assertSame(333, $payload['wine']['id']);
    }

    public function testCreateAcceptsWineTableStylePayloadKeys(): void
    {
        $controller = $this->controller(doCountries: [1 => Country::Spain], grapeIds: [5]);
        $request = Request::create(
            '/api/wines',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'name' => 'Wine Alias',
                'do_id' => 1,
                'wine_grapes' => [
                    ['grape_id' => 5, 'percentage' => 100],
                ],
                'wine_purchase' => [
                    [
                        'place' => [
                            'place_type' => 'restaurant',
                            'name' => 'Casa Paco',
                            'address' => 'Calle A',
                            'city' => 'Madrid',
                            'country' => 'spain',
                        ],
                        'price_paid' => '13.50',
                        'purchased_at' => '2026-02-28T09:00:00+00:00',
                    ],
                ],
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->create($request);

        self::assertSame(Response::HTTP_CREATED, $response->getStatusCode());
    }

    public function testListReturnsPaginatedWinesWithDefaults(): void
    {
        $controller = $this->controller();

        $request = Request::create('/api/wines', 'GET');
        $response = $controller->list($request);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame(1, $payload['pagination']['page']);
        self::assertSame(20, $payload['pagination']['limit']);
        self::assertSame('List Wine 1', $payload['items'][0]['name']);
        self::assertSame('bottle', $payload['items'][0]['photos'][0]['type']);
        self::assertSame('/images/wines/1/bottle.jpg', $payload['items'][0]['photos'][0]['url']);
    }

    public function testListReturnsBadRequestForInvalidQueryParam(): void
    {
        $controller = $this->controller();

        $request = Request::create('/api/wines?page=0', 'GET');
        $response = $controller->list($request);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testListAcceptsExtendedFilterQueryParams(): void
    {
        $controller = $this->controller();

        $request = Request::create('/api/wines?search=rioja&wine_type=red&country=spain&do_id=2&grape_id=5&score_bucket=90_plus&sort_by=score&sort_dir=desc', 'GET');
        $response = $controller->list($request);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame('Rioja', $payload['items'][0]['do']['name']);
        self::assertSame(91.5, $payload['items'][0]['avg_score']);
    }

    public function testDeleteReturnsNoContentWhenWineExists(): void
    {
        $controller = $this->controller(deletableWineIds: [33]);

        $response = $controller->delete(33);

        self::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());
    }

    public function testDeleteReturnsNotFoundWhenWineDoesNotExist(): void
    {
        $controller = $this->controller(deletableWineIds: []);

        $response = $controller->delete(999);

        self::assertSame(Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testUpdateReturnsNoContentWhenWineExists(): void
    {
        $controller = $this->controller(updatableWineIds: [20]);
        $request = Request::create(
            '/api/wines/20',
            'PUT',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['name' => 'Updated Name'], JSON_THROW_ON_ERROR),
        );

        $response = $controller->update(20, $request);

        self::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());
    }

    public function testUpdatePersistsGrapesPayloadInCommand(): void
    {
        $controller = $this->controller(updatableWineIds: [20]);
        $request = Request::create(
            '/api/wines/20',
            'PUT',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'name' => 'Updated Name',
                'grapes' => [
                    ['grape_id' => 5, 'percentage' => 70],
                    ['grape_id' => 8, 'percentage' => 30],
                ],
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->update(20, $request);

        self::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());
        self::assertNotNull(SpyWineRepository::$lastUpdateCommand);
        self::assertCount(2, SpyWineRepository::$lastUpdateCommand->grapes);
        self::assertSame(70.0, (float) SpyWineRepository::$lastUpdateCommand->grapes[0]->percentage);
        self::assertSame(30.0, (float) SpyWineRepository::$lastUpdateCommand->grapes[1]->percentage);
    }

    public function testUpdateReturnsNotFoundWhenWineDoesNotExist(): void
    {
        $controller = $this->controller(updatableWineIds: []);
        $request = Request::create(
            '/api/wines/999',
            'PUT',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['name' => 'Updated Name'], JSON_THROW_ON_ERROR),
        );

        $response = $controller->update(999, $request);

        self::assertSame(Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testGetByIdReturnsNotFoundWhenWineDoesNotExist(): void
    {
        $controller = $this->controller(detailedWineIds: []);

        $response = $controller->getById(404);

        self::assertSame(Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testGetByIdReturnsWineWithNestedRelations(): void
    {
        $controller = $this->controller(detailedWineIds: [77]);

        $response = $controller->getById(77);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame(77, $payload['wine']['id']);
        self::assertSame('Tempranillo', $payload['wine']['grapes'][0]['name']);
        self::assertSame('front_label', $payload['wine']['photos'][0]['type']);
        self::assertSame('parker', $payload['wine']['awards'][0]['name']);
        self::assertSame('fruity', $payload['wine']['reviews'][0]['bullets'][0]);
        self::assertSame('Madrid', $payload['wine']['purchases'][0]['place']['city']);
        self::assertSame('ribera', $payload['wine']['do']['name']);
    }

    /**
     * @param array<int,Country> $doCountries
     * @param list<int> $grapeIds
     * @param list<int> $deletableWineIds
     * @param list<int> $updatableWineIds
     * @param list<int> $detailedWineIds
     */
    private function controller(
        array $doCountries = [],
        array $grapeIds = [],
        array $deletableWineIds = [],
        array $updatableWineIds = [],
        array $detailedWineIds = [],
    ): WineController
    {
        SpyWineRepository::$lastUpdateCommand = null;
        $repo = new SpyWineRepository($deletableWineIds, $updatableWineIds, $detailedWineIds);

        return new WineController(
            new CreateWineHandler(
                $repo,
                new InMemoryDoRepository($doCountries),
                new InMemoryGrapeRepository($grapeIds),
            ),
            new UpdateWineHandler($repo, new InMemoryDoRepository($doCountries)),
            new DeleteWineHandler($repo, new NoopWinePhotoRepository(), new NoopWinePhotoStorage()),
            new GetWineDetailsHandler($repo),
            new ListWinesHandler($repo),
            new NoopWinePhotoRepository(),
        );
    }
}

final class SpyWineRepository implements WineRepository
{
    public static ?UpdateWineCommand $lastUpdateCommand = null;
    /**
     * @param list<int> $deletableWineIds
     * @param list<int> $updatableWineIds
     * @param list<int> $detailedWineIds
     */
    public function __construct(
        private array $deletableWineIds = [],
        private array $updatableWineIds = [],
        private array $detailedWineIds = [],
    )
    {
    }

    public function create(CreateWineCommand $command, ?Country $country): int
    {
        return 333;
    }

    public function deleteById(int $id): bool
    {
        return in_array($id, $this->deletableWineIds, true);
    }

    public function updatePartial(UpdateWineCommand $command): bool
    {
        self::$lastUpdateCommand = $command;
        return in_array($command->wineId, $this->updatableWineIds, true);
    }

    public function existsById(int $id): bool
    {
        return in_array($id, $this->updatableWineIds, true) || in_array($id, $this->deletableWineIds, true);
    }

    public function findById(int $id): ?Wine
    {
        if (!in_array($id, $this->detailedWineIds, true)) {
            return null;
        }

        return new Wine(
            id: $id,
            name: 'Wine Full',
            winery: 'Bodega Demo',
            wineType: WineType::Red,
            do: new DenominationOfOrigin(1, 'ribera', 'Castilla y Leon', Country::Spain, 'ES'),
            country: Country::Spain,
            agingType: AgingType::Reserve,
            vintageYear: 2020,
            alcoholPercentage: 14.5,
            createdAt: '2026-03-01T09:00:00+00:00',
            updatedAt: '2026-03-01T09:10:00+00:00',
            grapes: [new WineGrape(2, '90', 'Tempranillo', GrapeColor::Red)],
            purchases: [
                new WinePurchase(
                    new Place(PlaceType::Restaurant, 'Casa Paco', 'Calle A', 'Madrid', Country::Spain, 11),
                    '21.5',
                    new \DateTimeImmutable('2026-03-01T08:00:00+00:00'),
                    10,
                ),
            ],
            awards: [new Award(AwardName::Parker, '93.5', 2025, 3)],
            photos: [new WinePhoto(4, '/images/wines/77/front.jpg', WinePhotoType::FrontLabel, 'abc123', 12345, 'jpg')],
            reviews: [
                new WineReview(
                    userId: 8,
                    wineId: $id,
                    intensityAroma: 4,
                    sweetness: 2,
                    acidity: 3,
                    tannin: 2,
                    body: 4,
                    persistence: 5,
                    bullets: [ReviewBullet::Afrutado],
                    score: 92,
                    id: 5,
                    createdAt: new \DateTimeImmutable('2026-03-01T08:30:00+00:00'),
                    userName: 'Ana',
                    userLastname: 'Lopez',
                ),
            ],
        );
    }

    public function findPaginated(ListWinesQuery $query): ListWinesResult
    {
        return new ListWinesResult(
            items: [
                new WineListItemView(
                    id: 1,
                    name: 'List Wine 1',
                    winery: 'Bodega 1',
                    wineType: 'red',
                    country: 'spain',
                    doId: 3,
                    doName: 'Rioja',
                    vintageYear: 2022,
                    avgScore: 91.5,
                    updatedAt: '2026-03-01T09:00:00+00:00',
                ),
            ],
            page: $query->page,
            limit: $query->limit,
            totalItems: 1,
            totalPages: 1,
        );
    }
}

final class NoopWinePhotoRepository implements WinePhotoRepository
{
    public function findByWineAndType(int $wineId, WinePhotoType $type): ?WinePhoto
    {
        return null;
    }

    public function create(
        int $wineId,
        WinePhoto $photo,
    ): int {
        return 1;
    }

    public function update(WinePhoto $photo): void
    {
    }

    public function findByWineId(int $wineId): array
    {
        if (1 === $wineId) {
            return [new WinePhoto(1, '/images/wines/1/bottle.jpg', WinePhotoType::Bottle, 'hash123', 1000, 'jpg')];
        }

        return [];
    }
}

final class NoopWinePhotoStorage implements WinePhotoStoragePort
{
    public function save(string $sourcePath, int $wineId, string $hash, string $extension): string
    {
        return '/images/wines/'.$wineId.'/'.$hash.'.'.$extension;
    }

    public function deleteByUrl(string $url): void
    {
    }

    public function deleteWineDirectory(int $wineId): void
    {
    }

}

final class InMemoryDoRepository implements DoRepository
{
    /**
     * @param array<int,Country> $countryByDoId
     */
    public function __construct(private readonly array $countryByDoId)
    {
    }

    public function findCountryById(int $id): ?Country
    {
        return $this->countryByDoId[$id] ?? null;
    }

    public function findById(int $id): ?DenominationOfOrigin
    {
        $country = $this->findCountryById($id);
        if (null === $country) {
            return null;
        }

        return new DenominationOfOrigin(
            id: $id,
            name: 'DO '.$id,
            region: 'Region '.$id,
            country: $country,
            countryCode: 'ES',
        );
    }

    public function findAll(): array
    {
        return [];
    }
}

final class InMemoryGrapeRepository implements GrapeRepository
{
    /**
     * @param list<int> $existingIds
     */
    public function __construct(private readonly array $existingIds)
    {
    }

    public function findExistingIds(array $ids): array
    {
        return array_values(array_intersect($ids, $this->existingIds));
    }

    public function findAll(): array
    {
        return [];
    }
}
