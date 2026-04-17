<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Grape\DeleteGrape;

use App\Application\UseCases\Grape\DeleteGrape\DeleteGrapeHandler;
use App\Application\UseCases\Grape\DeleteGrape\DeleteGrapeHasAssociatedWines;
use App\Application\UseCases\Grape\DeleteGrape\DeleteGrapeNotFound;
use App\Domain\Enum\GrapeColor;
use App\Domain\Model\Grape;
use App\Domain\Repository\GrapeRepository;
use PHPUnit\Framework\TestCase;

final class DeleteGrapeHandlerTest extends TestCase
{
    public function testItDeletesExistingGrape(): void
    {
        $repository = new SpyDeleteGrapeRepository(deletableIds: [10]);
        $handler = new DeleteGrapeHandler($repository);

        $handler->handle(10);

        self::assertSame([10], $repository->deletedIds);
    }

    public function testItRejectsDeleteWhenGrapeHasAssociatedWines(): void
    {
        $repository = new SpyDeleteGrapeRepository(deletableIds: [10], associatedWineIds: [10]);
        $handler = new DeleteGrapeHandler($repository);

        $this->expectException(DeleteGrapeHasAssociatedWines::class);
        $handler->handle(10);
    }

    public function testItThrowsWhenGrapeDoesNotExist(): void
    {
        $repository = new SpyDeleteGrapeRepository(deletableIds: []);
        $handler = new DeleteGrapeHandler($repository);

        $this->expectException(DeleteGrapeNotFound::class);
        $handler->handle(99);
    }
}

final class SpyDeleteGrapeRepository implements GrapeRepository
{
    /** @var list<int> */
    public array $deletedIds = [];

    /**
     * @param list<int> $deletableIds
     * @param list<int> $associatedWineIds
     */
    public function __construct(
        private readonly array $deletableIds,
        private readonly array $associatedWineIds = [],
    ) {
    }

    public function findExistingIds(array $ids): array
    {
        return $ids;
    }

    public function create(Grape $grape): int
    {
        return 0;
    }

    public function findById(int $id): ?Grape
    {
        return new Grape($id, 'Grape '.$id, GrapeColor::Red);
    }

    public function findAll(array $sortFields = [], ?string $name = null, ?GrapeColor $color = null): array
    {
        return [];
    }

    public function update(Grape $grape): bool
    {
        return false;
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

