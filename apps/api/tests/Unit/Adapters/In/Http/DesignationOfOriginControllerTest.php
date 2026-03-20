<?php

declare(strict_types=1);

namespace App\Tests\Unit\Adapters\In\Http;

use App\Adapters\In\Http\DesignationOfOriginController;
use App\Application\Ports\PhotoStoragePort;
use App\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOrigin\CreateDesignationOfOriginHandler;
use App\Application\UseCases\DesignationOfOrigin\DeleteDesignationOfOrigin\DeleteDesignationOfOriginHandler;
use App\Application\UseCases\DesignationOfOrigin\ListDesignationsOfOrigin\ListDesignationsOfOriginHandler;
use App\Application\UseCases\DesignationOfOrigin\ListDesignationsOfOrigin\ListDesignationsOfOriginSort;
use App\Application\UseCases\Photo\PhotoInputGuard;
use App\Application\UseCases\DesignationOfOrigin\UpdateDesignationOfOrigin\UpdateDesignationOfOriginHandler;
use App\Domain\Enum\Country;
use App\Domain\Enum\DoAssetType;
use App\Domain\Model\DesignationOfOrigin;
use App\Domain\Repository\DesignationOfOriginRepository;
use Doctrine\DBAL\Driver\PDO\Exception as DoctrinePdoException;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use PDOException;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

final class DesignationOfOriginControllerTest extends TestCase
{
    public function testListReturnsDoItemsWithRegionAndCountry(): void
    {
        $repository = new DesignationOfOriginControllerInMemoryDesignationOfOriginRepository();
        $controller = new DesignationOfOriginController(
            new CreateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new ListDesignationsOfOriginHandler($repository),
            new UpdateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new DeleteDesignationOfOriginHandler($repository, new DesignationOfOriginControllerNullDesignationOfOriginAssetStorage()),
        );

        $response = $controller->list(Request::create('/api/dos', 'GET'));
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertCount(2, $payload['items']);
        self::assertSame('Rioja', $payload['items'][0]['name']);
        self::assertSame('La Rioja', $payload['items'][0]['region']);
        self::assertSame('spain', $payload['items'][0]['country']);
        self::assertSame('rioja_DO.png', $payload['items'][0]['do_logo']);
        self::assertSame('la_rioja.png', $payload['items'][0]['region_logo']);
        self::assertSame(['lat' => 42.46, 'lng' => -2.44, 'zoom' => 7], $payload['items'][0]['map_data']);
        self::assertSame(ListDesignationsOfOriginSort::DEFAULT_ORDER, $repository->lastSortFields);
    }

    public function testListAcceptsCustomSortOrder(): void
    {
        $repository = new DesignationOfOriginControllerInMemoryDesignationOfOriginRepository();
        $controller = new DesignationOfOriginController(
            new CreateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new ListDesignationsOfOriginHandler($repository),
            new UpdateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new DeleteDesignationOfOriginHandler($repository, new DesignationOfOriginControllerNullDesignationOfOriginAssetStorage()),
        );

        $response = $controller->list(Request::create('/api/dos?sort_by_1=name&sort_by_2=country&sort_by_3=region', 'GET'));

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame(
            [ListDesignationsOfOriginSort::NAME, ListDesignationsOfOriginSort::COUNTRY, ListDesignationsOfOriginSort::REGION],
            $repository->lastSortFields,
        );
    }

    public function testListReturnsBadRequestForDuplicateSortField(): void
    {
        $repository = new DesignationOfOriginControllerInMemoryDesignationOfOriginRepository();
        $controller = new DesignationOfOriginController(
            new CreateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new ListDesignationsOfOriginHandler($repository),
            new UpdateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new DeleteDesignationOfOriginHandler($repository, new DesignationOfOriginControllerNullDesignationOfOriginAssetStorage()),
        );

        $response = $controller->list(Request::create('/api/dos?sort_by_1=country&sort_by_2=country', 'GET'));
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        self::assertSame('sort_by_2 contains duplicate sort field "country".', $payload['error']);
    }

    public function testListPassesFiltersToRepository(): void
    {
        $repository = new DesignationOfOriginControllerInMemoryDesignationOfOriginRepository();
        $controller = new DesignationOfOriginController(
            new CreateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new ListDesignationsOfOriginHandler($repository),
            new UpdateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new DeleteDesignationOfOriginHandler($repository, new DesignationOfOriginControllerNullDesignationOfOriginAssetStorage()),
        );

        $response = $controller->list(Request::create('/api/dos?name=rio&country=spain&region=rioja', 'GET'));

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame('rio', $repository->lastNameFilter);
        self::assertSame(Country::Spain, $repository->lastCountryFilter);
        self::assertSame('rioja', $repository->lastRegionFilter);
    }

    public function testListPassesUserIdsFilterToRepository(): void
    {
        $repository = new DesignationOfOriginControllerInMemoryDesignationOfOriginRepository();
        $controller = new DesignationOfOriginController(
            new CreateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new ListDesignationsOfOriginHandler($repository),
            new UpdateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new DeleteDesignationOfOriginHandler($repository, new DesignationOfOriginControllerNullDesignationOfOriginAssetStorage()),
        );

        $response = $controller->list(Request::create('/api/dos?user_ids=1,2,2', 'GET'));

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame([1, 2], $repository->lastUserIdsFilter);
    }

    public function testListReturnsBadRequestForInvalidUserIdsFilter(): void
    {
        $repository = new DesignationOfOriginControllerInMemoryDesignationOfOriginRepository();
        $controller = new DesignationOfOriginController(
            new CreateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new ListDesignationsOfOriginHandler($repository),
            new UpdateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new DeleteDesignationOfOriginHandler($repository, new DesignationOfOriginControllerNullDesignationOfOriginAssetStorage()),
        );

        $response = $controller->list(Request::create('/api/dos?user_ids=1,abc', 'GET'));
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        self::assertSame('user_ids must be a comma-separated string of integers >= 1.', $payload['error']);
    }

    public function testListReturnsBadRequestForInvalidCountryFilter(): void
    {
        $repository = new DesignationOfOriginControllerInMemoryDesignationOfOriginRepository();
        $controller = new DesignationOfOriginController(
            new CreateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new ListDesignationsOfOriginHandler($repository),
            new UpdateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new DeleteDesignationOfOriginHandler($repository, new DesignationOfOriginControllerNullDesignationOfOriginAssetStorage()),
        );

        $response = $controller->list(Request::create('/api/dos?country=usa', 'GET'));
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        self::assertSame('Invalid country value.', $payload['error']);
    }

    public function testUpdateReturnsNoContentWhenDoExists(): void
    {
        $repository = new DesignationOfOriginControllerInMemoryDesignationOfOriginRepository(updatableIds: [20]);
        $controller = new DesignationOfOriginController(
            new CreateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new ListDesignationsOfOriginHandler($repository),
            new UpdateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new DeleteDesignationOfOriginHandler($repository, new DesignationOfOriginControllerNullDesignationOfOriginAssetStorage()),
        );
        $request = Request::create(
            '/api/dos/20',
            'PUT',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['name' => 'Updated Name'], JSON_THROW_ON_ERROR),
        );

        $response = $controller->update(20, $request);

        self::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());
        self::assertSame('Updated Name', $repository->lastUpdatedDo?->name);
        self::assertSame('La Rioja', $repository->lastUpdatedDo?->region);
        self::assertSame('la_rioja.png', $repository->lastUpdatedDo?->regionLogo);
        self::assertSame(42.46, $repository->lastUpdatedDo?->mapData['lat']);
    }

    public function testUpdateReturnsBadRequestWhenRegionLogoIsProvided(): void
    {
        $repository = new DesignationOfOriginControllerInMemoryDesignationOfOriginRepository(updatableIds: [20]);
        $controller = new DesignationOfOriginController(
            new CreateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new ListDesignationsOfOriginHandler($repository),
            new UpdateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new DeleteDesignationOfOriginHandler($repository, new DesignationOfOriginControllerNullDesignationOfOriginAssetStorage()),
        );
        $request = Request::create(
            '/api/dos/20',
            'PUT',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['region_logo' => 'murcia.png'], JSON_THROW_ON_ERROR),
        );

        $response = $controller->update(20, $request);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        self::assertSame('region_logo cannot be updated via this endpoint.', $payload['error']);
    }

    public function testUpdateReturnsBadRequestForInvalidCountry(): void
    {
        $repository = new DesignationOfOriginControllerInMemoryDesignationOfOriginRepository(updatableIds: [20]);
        $controller = new DesignationOfOriginController(
            new CreateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new ListDesignationsOfOriginHandler($repository),
            new UpdateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new DeleteDesignationOfOriginHandler($repository, new DesignationOfOriginControllerNullDesignationOfOriginAssetStorage()),
        );
        $request = Request::create(
            '/api/dos/20',
            'PUT',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['country' => 'usa'], JSON_THROW_ON_ERROR),
        );

        $response = $controller->update(20, $request);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        self::assertSame('Invalid country value.', $payload['error']);
    }

    public function testUpdateReturnsBadRequestForInvalidDoLogoExtension(): void
    {
        $repository = new DesignationOfOriginControllerInMemoryDesignationOfOriginRepository(updatableIds: [20]);
        $controller = new DesignationOfOriginController(
            new CreateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new ListDesignationsOfOriginHandler($repository),
            new UpdateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new DeleteDesignationOfOriginHandler($repository, new DesignationOfOriginControllerNullDesignationOfOriginAssetStorage()),
        );
        $request = Request::create(
            '/api/dos/20',
            'PUT',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['do_logo' => 'logo.txt'], JSON_THROW_ON_ERROR),
        );

        $response = $controller->update(20, $request);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        self::assertSame('do_logo must use an image extension: jpg, jpeg, png, webp, gif, avif.', $payload['error']);
    }

    public function testUpdateReturnsNoContentWhenMapDataIsProvided(): void
    {
        $repository = new DesignationOfOriginControllerInMemoryDesignationOfOriginRepository(updatableIds: [20]);
        $controller = new DesignationOfOriginController(
            new CreateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new ListDesignationsOfOriginHandler($repository),
            new UpdateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new DeleteDesignationOfOriginHandler($repository, new DesignationOfOriginControllerNullDesignationOfOriginAssetStorage()),
        );
        $request = Request::create(
            '/api/dos/20',
            'PUT',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['map_data' => ['lat' => 41.65, 'lng' => -4.01, 'zoom' => 8]], JSON_THROW_ON_ERROR),
        );

        $response = $controller->update(20, $request);

        self::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());
        self::assertSame(41.65, $repository->lastUpdatedDo?->mapData['lat']);
        self::assertSame(-4.01, $repository->lastUpdatedDo?->mapData['lng']);
        self::assertSame(8, $repository->lastUpdatedDo?->mapData['zoom']);
    }

    public function testUpdateReturnsNotFoundWhenDoDoesNotExist(): void
    {
        $repository = new DesignationOfOriginControllerInMemoryDesignationOfOriginRepository(updatableIds: []);
        $controller = new DesignationOfOriginController(
            new CreateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new ListDesignationsOfOriginHandler($repository),
            new UpdateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new DeleteDesignationOfOriginHandler($repository, new DesignationOfOriginControllerNullDesignationOfOriginAssetStorage()),
        );
        $request = Request::create(
            '/api/dos/999',
            'PUT',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['name' => 'Updated Name'], JSON_THROW_ON_ERROR),
        );

        $response = $controller->update(999, $request);

        self::assertSame(Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testDeleteReturnsNoContentWhenDoExists(): void
    {
        $repository = new DesignationOfOriginControllerInMemoryDesignationOfOriginRepository(deletableIds: [33]);
        $controller = new DesignationOfOriginController(
            new CreateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new ListDesignationsOfOriginHandler($repository),
            new UpdateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new DeleteDesignationOfOriginHandler($repository, new DesignationOfOriginControllerNullDesignationOfOriginAssetStorage()),
        );

        $response = $controller->delete(33);

        self::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());
    }

    public function testDeleteReturnsConflictWhenDoHasAssociatedWines(): void
    {
        $repository = new DesignationOfOriginControllerInMemoryDesignationOfOriginRepository(deletableIds: [33], associatedWineIds: [33]);
        $controller = new DesignationOfOriginController(
            new CreateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new ListDesignationsOfOriginHandler($repository),
            new UpdateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new DeleteDesignationOfOriginHandler($repository, new DesignationOfOriginControllerNullDesignationOfOriginAssetStorage()),
        );

        $response = $controller->delete(33);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_CONFLICT, $response->getStatusCode());
        self::assertSame('DO 33 cannot be deleted because it has associated wines.', $payload['error']);
    }

    public function testDeleteReturnsNotFoundWhenDoDoesNotExist(): void
    {
        $repository = new DesignationOfOriginControllerInMemoryDesignationOfOriginRepository(deletableIds: []);
        $controller = new DesignationOfOriginController(
            new CreateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new ListDesignationsOfOriginHandler($repository),
            new UpdateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new DeleteDesignationOfOriginHandler($repository, new DesignationOfOriginControllerNullDesignationOfOriginAssetStorage()),
        );

        $response = $controller->delete(999);

        self::assertSame(Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testCreateReturnsCreatedWhenPayloadIsValid(): void
    {
        $repository = new DesignationOfOriginControllerInMemoryDesignationOfOriginRepository();
        $controller = new DesignationOfOriginController(
            new CreateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new ListDesignationsOfOriginHandler($repository),
            new UpdateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new DeleteDesignationOfOriginHandler($repository, new DesignationOfOriginControllerNullDesignationOfOriginAssetStorage()),
        );
        $request = Request::create(
            '/api/dos',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'name' => 'Montsant',
                'region' => 'Catalunya',
                'country' => 'spain',
                'country_code' => 'es',
                'do_logo' => 'montsant_DO.png',
                'map_data' => ['lat' => 41.3, 'lng' => 0.7, 'zoom' => 7],
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->create($request);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_CREATED, $response->getStatusCode());
        self::assertSame(150, $payload['do']['id']);
        self::assertSame('Montsant', $repository->lastCreatedDo?->name);
        self::assertSame('ES', $repository->lastCreatedDo?->countryCode);
        self::assertNull($repository->lastCreatedDo?->regionLogo);
        self::assertSame(41.3, $repository->lastCreatedDo?->mapData['lat']);
    }

    public function testCreateReturnsBadRequestWhenRegionLogoIsProvided(): void
    {
        $repository = new DesignationOfOriginControllerInMemoryDesignationOfOriginRepository();
        $controller = new DesignationOfOriginController(
            new CreateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new ListDesignationsOfOriginHandler($repository),
            new UpdateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new DeleteDesignationOfOriginHandler($repository, new DesignationOfOriginControllerNullDesignationOfOriginAssetStorage()),
        );
        $request = Request::create(
            '/api/dos',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'name' => 'Montsant',
                'region' => 'Catalunya',
                'country' => 'spain',
                'country_code' => 'ES',
                'region_logo' => 'catalunya.png',
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->create($request);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        self::assertSame('region_logo cannot be created via this endpoint.', $payload['error']);
    }

    public function testCreateReturnsBadRequestForInvalidDoLogoExtension(): void
    {
        $repository = new DesignationOfOriginControllerInMemoryDesignationOfOriginRepository();
        $controller = new DesignationOfOriginController(
            new CreateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new ListDesignationsOfOriginHandler($repository),
            new UpdateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new DeleteDesignationOfOriginHandler($repository, new DesignationOfOriginControllerNullDesignationOfOriginAssetStorage()),
        );
        $request = Request::create(
            '/api/dos',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'name' => 'Montsant',
                'region' => 'Catalunya',
                'country' => 'spain',
                'country_code' => 'ES',
                'do_logo' => 'montsant_DO.txt',
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->create($request);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        self::assertSame('do_logo must use an image extension: jpg, jpeg, png, webp, gif, avif.', $payload['error']);
    }

    public function testCreateReturnsConflictWhenDoAlreadyExists(): void
    {
        $repository = new DesignationOfOriginControllerInMemoryDesignationOfOriginRepository(throwUniqueConstraintOnCreate: true);
        $controller = new DesignationOfOriginController(
            new CreateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new ListDesignationsOfOriginHandler($repository),
            new UpdateDesignationOfOriginHandler($repository, new PhotoInputGuard()),
            new DeleteDesignationOfOriginHandler($repository, new DesignationOfOriginControllerNullDesignationOfOriginAssetStorage()),
        );
        $request = Request::create(
            '/api/dos',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'name' => 'Montsant',
                'region' => 'Catalunya',
                'country' => 'spain',
                'country_code' => 'ES',
                'do_logo' => null,
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->create($request);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_CONFLICT, $response->getStatusCode());
        self::assertSame(
            'A denomination of origin with the same country and name already exists.',
            $payload['error'],
        );
    }
}

final class DesignationOfOriginControllerInMemoryDesignationOfOriginRepository implements DesignationOfOriginRepository
{
    /** @var list<string> */
    public array $lastSortFields = [];
    public ?string $lastNameFilter = null;
    public ?Country $lastCountryFilter = null;
    public ?string $lastRegionFilter = null;
    /** @var list<int> */
    public array $lastUserIdsFilter = [];
    public ?DesignationOfOrigin $lastCreatedDo = null;
    public ?DesignationOfOrigin $lastUpdatedDo = null;
    /** @var list<int> */
    public array $deletedIds = [];

    /**
     * @param list<int> $updatableIds
     * @param list<int> $deletableIds
     * @param list<int> $associatedWineIds
     */
    public function __construct(
        private readonly array $updatableIds = [],
        private readonly array $deletableIds = [],
        private readonly array $associatedWineIds = [],
        private readonly bool $throwUniqueConstraintOnCreate = false,
    ) {
    }

    public function create(DesignationOfOrigin $do): int
    {
        if ($this->throwUniqueConstraintOnCreate) {
            throw new UniqueConstraintViolationException(
                DoctrinePdoException::new(new PDOException('duplicate key value violates unique constraint "uniq_do_country_name"')),
                null,
            );
        }

        $this->lastCreatedDo = $do;

        return 150;
    }

    public function findById(int $id): ?DesignationOfOrigin
    {
        return new DesignationOfOrigin(
            $id,
            'Rioja',
            'La Rioja',
            Country::Spain,
            'ES',
            'rioja_DO.png',
            'la_rioja.png',
            ['lat' => 42.46, 'lng' => -2.44, 'zoom' => 7],
        );
    }

    public function findCountryById(int $id): ?Country
    {
        return null;
    }

    public function findAll(
        array $sortFields = [],
        ?string $name = null,
        ?Country $country = null,
        ?string $region = null,
        array $userIds = [],
    ): array
    {
        $this->lastSortFields = $sortFields;
        $this->lastNameFilter = $name;
        $this->lastCountryFilter = $country;
        $this->lastRegionFilter = $region;
        $this->lastUserIdsFilter = $userIds;

        return [
            new DesignationOfOrigin(1, 'Rioja', 'La Rioja', Country::Spain, 'ES', 'rioja_DO.png', 'la_rioja.png', ['lat' => 42.46, 'lng' => -2.44, 'zoom' => 7]),
            new DesignationOfOrigin(2, 'Priorat', 'Catalunya', Country::Spain, 'ES', 'priorat_DO.png', 'cataluna.png', null),
        ];
    }

    public function update(DesignationOfOrigin $do): bool
    {
        $this->lastUpdatedDo = $do;

        return in_array($do->id, $this->updatableIds, true);
    }

    public function deleteById(int $id): bool
    {
        $this->deletedIds[] = $id;

        return in_array($id, $this->deletableIds, true);
    }

    public function hasAssociatedWines(int $id): bool
    {
        return in_array($id, $this->associatedWineIds, true);
    }
}

final class DesignationOfOriginControllerNullDesignationOfOriginAssetStorage implements PhotoStoragePort
{
    public function save(string $sourcePath, int $wineId, string $hash, string $extension): string
    {
        return 'saved_asset.png';
    }

    public function deleteByUrl(string $entity, string $url): void
    {
    }

    public function deleteDirectory(string $entity, int $wineId): void
    {
    }
}
