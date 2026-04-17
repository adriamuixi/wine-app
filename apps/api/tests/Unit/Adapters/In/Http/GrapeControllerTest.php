<?php

declare(strict_types=1);

namespace App\Tests\Unit\Adapters\In\Http;

use App\Adapters\In\Http\GrapeController;
use App\Application\Ports\AuthSessionManager;
use App\Application\UseCases\Grape\CreateGrape\CreateGrapeHandler;
use App\Application\UseCases\Grape\DeleteGrape\DeleteGrapeHandler;
use App\Application\UseCases\Grape\ListGrapes\ListGrapesHandler;
use App\Application\UseCases\Grape\ListGrapes\ListGrapesSort;
use App\Application\UseCases\Grape\UpdateGrape\UpdateGrapeHandler;
use App\Domain\Enum\GrapeColor;
use App\Domain\Model\Grape;
use App\Domain\Repository\GrapeRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

final class GrapeControllerTest extends TestCase
{
    public function testListReturnsItemsForDirectory(): void
    {
        $repository = new GrapeControllerInMemoryGrapeRepository();
        $controller = $this->buildController($repository, new AllowAllAuthSessionManagerForGrapeController());

        $response = $controller->list(Request::create('/api/grapes', 'GET'));
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertCount(2, $payload['items']);
        self::assertSame('Syrah', $payload['items'][0]['name']);
        self::assertSame('red', $payload['items'][0]['color']);
        self::assertSame(ListGrapesSort::DEFAULT_ORDER, $repository->lastSortFields);
    }

    public function testListAcceptsCustomSortAndFilters(): void
    {
        $repository = new GrapeControllerInMemoryGrapeRepository();
        $controller = $this->buildController($repository, new AllowAllAuthSessionManagerForGrapeController());

        $response = $controller->list(Request::create('/api/grapes?sort_by_1=name&sort_by_2=color&name=tempr&color=red', 'GET'));

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame([ListGrapesSort::NAME, ListGrapesSort::COLOR], $repository->lastSortFields);
        self::assertSame('tempr', $repository->lastNameFilter);
        self::assertSame(GrapeColor::Red, $repository->lastColorFilter);
    }

    public function testListReturnsBadRequestForInvalidColorFilter(): void
    {
        $repository = new GrapeControllerInMemoryGrapeRepository();
        $controller = $this->buildController($repository, new AllowAllAuthSessionManagerForGrapeController());

        $response = $controller->list(Request::create('/api/grapes?color=rose', 'GET'));
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        self::assertSame('Invalid color value.', $payload['error']);
    }

    public function testCreateReturnsCreatedWhenAuthenticated(): void
    {
        $repository = new GrapeControllerInMemoryGrapeRepository();
        $controller = $this->buildController($repository, new AllowAllAuthSessionManagerForGrapeController());

        $request = Request::create(
            '/api/grapes',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['name' => 'Garnacha', 'color' => 'red'], JSON_THROW_ON_ERROR),
        );

        $response = $controller->create($request);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_CREATED, $response->getStatusCode());
        self::assertSame(3, $payload['grape']['id']);
    }

    public function testCreateReturnsUnauthorizedWhenUnauthenticated(): void
    {
        $repository = new GrapeControllerInMemoryGrapeRepository();
        $controller = $this->buildController($repository, new DenyAuthSessionManagerForGrapeController());

        $request = Request::create(
            '/api/grapes',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['name' => 'Garnacha', 'color' => 'red'], JSON_THROW_ON_ERROR),
        );

        $response = $controller->create($request);

        self::assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
    }

    public function testUpdateReturnsNoContentWhenGrapeExists(): void
    {
        $repository = new GrapeControllerInMemoryGrapeRepository(updatableIds: [2]);
        $controller = $this->buildController($repository, new AllowAllAuthSessionManagerForGrapeController());

        $request = Request::create(
            '/api/grapes/2',
            'PUT',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['name' => 'Syrah Premium'], JSON_THROW_ON_ERROR),
        );

        $response = $controller->update(2, $request);

        self::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());
        self::assertSame('Syrah Premium', $repository->items[2]->name);
    }

    public function testDeleteReturnsConflictWhenGrapeHasAssociatedWines(): void
    {
        $repository = new GrapeControllerInMemoryGrapeRepository(associatedWineIds: [1]);
        $controller = $this->buildController($repository, new AllowAllAuthSessionManagerForGrapeController());

        $response = $controller->delete(1);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_CONFLICT, $response->getStatusCode());
        self::assertSame('Grape 1 cannot be deleted because it has associated wines.', $payload['error']);
    }

    private function buildController(
        GrapeControllerInMemoryGrapeRepository $repository,
        AuthSessionManager $authSession,
    ): GrapeController {
        return new GrapeController(
            $authSession,
            new ListGrapesHandler($repository),
            new CreateGrapeHandler($repository),
            new UpdateGrapeHandler($repository),
            new DeleteGrapeHandler($repository),
        );
    }
}

final class GrapeControllerInMemoryGrapeRepository implements GrapeRepository
{
    /** @var array<int,Grape> */
    public array $items = [];

    /** @var list<string> */
    public array $lastSortFields = [];
    public ?string $lastNameFilter = null;
    public ?GrapeColor $lastColorFilter = null;

    /** @var list<int> */
    private array $updatableIds;

    /** @var list<int> */
    private array $associatedWineIds;

    /**
     * @param list<int> $updatableIds
     * @param list<int> $associatedWineIds
     */
    public function __construct(array $updatableIds = [1, 2], array $associatedWineIds = [])
    {
        $this->updatableIds = $updatableIds;
        $this->associatedWineIds = $associatedWineIds;
        $this->items = [
            1 => new Grape(1, 'Tempranillo', GrapeColor::Red),
            2 => new Grape(2, 'Syrah', GrapeColor::Red),
        ];
    }

    public function findExistingIds(array $ids): array
    {
        return array_values(array_filter($ids, fn (int $id): bool => isset($this->items[$id])));
    }

    public function create(Grape $grape): int
    {
        $id = count($this->items) + 1;
        $this->items[$id] = new Grape($id, $grape->name, $grape->color);

        return $id;
    }

    public function findById(int $id): ?Grape
    {
        return $this->items[$id] ?? null;
    }

    public function findAll(array $sortFields = [], ?string $name = null, ?GrapeColor $color = null): array
    {
        $this->lastSortFields = [] === $sortFields ? ListGrapesSort::DEFAULT_ORDER : $sortFields;
        $this->lastNameFilter = $name;
        $this->lastColorFilter = $color;

        $items = array_values($this->items);

        if (null !== $name && '' !== trim($name)) {
            $needle = strtolower(trim($name));
            $items = array_values(array_filter($items, static fn (Grape $item): bool => str_contains(strtolower($item->name), $needle)));
        }

        if (null !== $color) {
            $items = array_values(array_filter($items, static fn (Grape $item): bool => $item->color === $color));
        }

        usort($items, static function (Grape $left, Grape $right): int {
            if ($left->color !== $right->color) {
                return $left->color === GrapeColor::Red ? -1 : 1;
            }

            return $left->name <=> $right->name;
        });

        return $items;
    }

    public function update(Grape $grape): bool
    {
        if (!in_array($grape->id, $this->updatableIds, true)) {
            return false;
        }

        $this->items[$grape->id] = $grape;

        return true;
    }

    public function deleteById(int $id): bool
    {
        if (!isset($this->items[$id])) {
            return false;
        }

        unset($this->items[$id]);

        return true;
    }

    public function hasAssociatedWines(int $id): bool
    {
        return in_array($id, $this->associatedWineIds, true);
    }
}

final class AllowAllAuthSessionManagerForGrapeController implements AuthSessionManager
{
    public function loginByUserId(int $userId): void
    {
    }

    public function getAuthenticatedUserId(): ?int
    {
        return 1;
    }

    public function logout(): void
    {
    }
}

final class DenyAuthSessionManagerForGrapeController implements AuthSessionManager
{
    public function loginByUserId(int $userId): void
    {
    }

    public function getAuthenticatedUserId(): ?int
    {
        return null;
    }

    public function logout(): void
    {
    }
}
