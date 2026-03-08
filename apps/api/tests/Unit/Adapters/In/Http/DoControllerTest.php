<?php

declare(strict_types=1);

namespace App\Tests\Unit\Adapters\In\Http;

use App\Adapters\In\Http\DoController;
use App\Application\UseCases\Do\CreateDo\CreateDoHandler;
use App\Application\UseCases\Do\DeleteDo\DeleteDoHandler;
use App\Application\UseCases\Do\ListDos\ListDosHandler;
use App\Application\UseCases\Do\ListDos\ListDosSort;
use App\Application\UseCases\Do\UpdateDo\UpdateDoHandler;
use App\Domain\Enum\Country;
use App\Domain\Model\DenominationOfOrigin;
use App\Domain\Repository\DoRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

final class DoControllerTest extends TestCase
{
    public function testListReturnsDoItemsWithRegionAndCountry(): void
    {
        $repository = new DoControllerInMemoryDoRepository();
        $controller = new DoController(
            new CreateDoHandler($repository),
            new ListDosHandler($repository),
            new UpdateDoHandler($repository),
            new DeleteDoHandler($repository),
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
        self::assertSame(ListDosSort::DEFAULT_ORDER, $repository->lastSortFields);
    }

    public function testListAcceptsCustomSortOrder(): void
    {
        $repository = new DoControllerInMemoryDoRepository();
        $controller = new DoController(
            new CreateDoHandler($repository),
            new ListDosHandler($repository),
            new UpdateDoHandler($repository),
            new DeleteDoHandler($repository),
        );

        $response = $controller->list(Request::create('/api/dos?sort_by_1=name&sort_by_2=country&sort_by_3=region', 'GET'));

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame(
            [ListDosSort::NAME, ListDosSort::COUNTRY, ListDosSort::REGION],
            $repository->lastSortFields,
        );
    }

    public function testListReturnsBadRequestForDuplicateSortField(): void
    {
        $repository = new DoControllerInMemoryDoRepository();
        $controller = new DoController(
            new CreateDoHandler($repository),
            new ListDosHandler($repository),
            new UpdateDoHandler($repository),
            new DeleteDoHandler($repository),
        );

        $response = $controller->list(Request::create('/api/dos?sort_by_1=country&sort_by_2=country', 'GET'));
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        self::assertSame('sort_by_2 contains duplicate sort field "country".', $payload['error']);
    }

    public function testUpdateReturnsNoContentWhenDoExists(): void
    {
        $repository = new DoControllerInMemoryDoRepository(updatableIds: [20]);
        $controller = new DoController(
            new CreateDoHandler($repository),
            new ListDosHandler($repository),
            new UpdateDoHandler($repository),
            new DeleteDoHandler($repository),
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
    }

    public function testUpdateReturnsBadRequestWhenRegionLogoIsProvided(): void
    {
        $repository = new DoControllerInMemoryDoRepository(updatableIds: [20]);
        $controller = new DoController(
            new CreateDoHandler($repository),
            new ListDosHandler($repository),
            new UpdateDoHandler($repository),
            new DeleteDoHandler($repository),
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
        $repository = new DoControllerInMemoryDoRepository(updatableIds: [20]);
        $controller = new DoController(
            new CreateDoHandler($repository),
            new ListDosHandler($repository),
            new UpdateDoHandler($repository),
            new DeleteDoHandler($repository),
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

    public function testUpdateReturnsNotFoundWhenDoDoesNotExist(): void
    {
        $repository = new DoControllerInMemoryDoRepository(updatableIds: []);
        $controller = new DoController(
            new CreateDoHandler($repository),
            new ListDosHandler($repository),
            new UpdateDoHandler($repository),
            new DeleteDoHandler($repository),
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
        $repository = new DoControllerInMemoryDoRepository(deletableIds: [33]);
        $controller = new DoController(
            new CreateDoHandler($repository),
            new ListDosHandler($repository),
            new UpdateDoHandler($repository),
            new DeleteDoHandler($repository),
        );

        $response = $controller->delete(33);

        self::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());
    }

    public function testDeleteReturnsConflictWhenDoHasAssociatedWines(): void
    {
        $repository = new DoControllerInMemoryDoRepository(deletableIds: [33], associatedWineIds: [33]);
        $controller = new DoController(
            new CreateDoHandler($repository),
            new ListDosHandler($repository),
            new UpdateDoHandler($repository),
            new DeleteDoHandler($repository),
        );

        $response = $controller->delete(33);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_CONFLICT, $response->getStatusCode());
        self::assertSame('DO 33 cannot be deleted because it has associated wines.', $payload['error']);
    }

    public function testDeleteReturnsNotFoundWhenDoDoesNotExist(): void
    {
        $repository = new DoControllerInMemoryDoRepository(deletableIds: []);
        $controller = new DoController(
            new CreateDoHandler($repository),
            new ListDosHandler($repository),
            new UpdateDoHandler($repository),
            new DeleteDoHandler($repository),
        );

        $response = $controller->delete(999);

        self::assertSame(Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testCreateReturnsCreatedWhenPayloadIsValid(): void
    {
        $repository = new DoControllerInMemoryDoRepository();
        $controller = new DoController(
            new CreateDoHandler($repository),
            new ListDosHandler($repository),
            new UpdateDoHandler($repository),
            new DeleteDoHandler($repository),
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
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->create($request);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_CREATED, $response->getStatusCode());
        self::assertSame(150, $payload['do']['id']);
        self::assertSame('Montsant', $repository->lastCreatedDo?->name);
        self::assertSame('ES', $repository->lastCreatedDo?->countryCode);
        self::assertNull($repository->lastCreatedDo?->regionLogo);
    }

    public function testCreateReturnsBadRequestWhenRegionLogoIsProvided(): void
    {
        $repository = new DoControllerInMemoryDoRepository();
        $controller = new DoController(
            new CreateDoHandler($repository),
            new ListDosHandler($repository),
            new UpdateDoHandler($repository),
            new DeleteDoHandler($repository),
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
}

final class DoControllerInMemoryDoRepository implements DoRepository
{
    /** @var list<string> */
    public array $lastSortFields = [];
    public ?DenominationOfOrigin $lastCreatedDo = null;
    public ?DenominationOfOrigin $lastUpdatedDo = null;
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
    ) {
    }

    public function create(DenominationOfOrigin $do): int
    {
        $this->lastCreatedDo = $do;

        return 150;
    }

    public function findById(int $id): ?DenominationOfOrigin
    {
        return new DenominationOfOrigin($id, 'Rioja', 'La Rioja', Country::Spain, 'ES', 'rioja_DO.png', 'la_rioja.png');
    }

    public function findCountryById(int $id): ?Country
    {
        return null;
    }

    public function findAll(array $sortFields = []): array
    {
        $this->lastSortFields = $sortFields;

        return [
            new DenominationOfOrigin(1, 'Rioja', 'La Rioja', Country::Spain, 'ES', 'rioja_DO.png', 'la_rioja.png'),
            new DenominationOfOrigin(2, 'Priorat', 'Catalunya', Country::Spain, 'ES', 'priorat_DO.png', 'cataluna.png'),
        ];
    }

    public function update(DenominationOfOrigin $do): bool
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
