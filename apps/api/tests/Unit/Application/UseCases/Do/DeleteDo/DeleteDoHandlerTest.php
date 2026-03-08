<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Do\DeleteDo;

use App\Application\UseCases\Do\DeleteDo\DeleteDoHandler;
use App\Application\UseCases\Do\DeleteDo\DeleteDoHasAssociatedWines;
use App\Application\UseCases\Do\DeleteDo\DeleteDoNotFound;
use App\Domain\Enum\Country;
use App\Domain\Model\DenominationOfOrigin;
use App\Domain\Repository\DoRepository;
use PHPUnit\Framework\TestCase;

final class DeleteDoHandlerTest extends TestCase
{
    public function testItDeletesExistingDo(): void
    {
        $repository = new SpyDeleteDoRepository(deletableIds: [10]);
        $handler = new DeleteDoHandler($repository);

        $handler->handle(10);

        self::assertSame([10], $repository->deletedIds);
    }

    public function testItRejectsDeleteWhenDoHasAssociatedWines(): void
    {
        $repository = new SpyDeleteDoRepository(deletableIds: [10], associatedWineIds: [10]);
        $handler = new DeleteDoHandler($repository);

        $this->expectException(DeleteDoHasAssociatedWines::class);
        $handler->handle(10);
        self::assertSame([], $repository->deletedIds);
    }

    public function testItThrowsWhenDoDoesNotExist(): void
    {
        $repository = new SpyDeleteDoRepository(deletableIds: []);
        $handler = new DeleteDoHandler($repository);

        $this->expectException(DeleteDoNotFound::class);
        $handler->handle(99);
    }
}

final class SpyDeleteDoRepository implements DoRepository
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

    public function findById(int $id): ?DenominationOfOrigin
    {
        return new DenominationOfOrigin($id, 'DO '.$id, 'Region '.$id, Country::Spain, 'ES', null, null);
    }

    public function findCountryById(int $id): ?Country
    {
        return Country::Spain;
    }

    public function findAll(array $sortFields = []): array
    {
        return [];
    }

    public function update(DenominationOfOrigin $do): bool
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
