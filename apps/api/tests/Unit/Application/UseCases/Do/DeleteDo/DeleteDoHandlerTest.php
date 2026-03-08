<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Do\DeleteDo;

use App\Application\Ports\PhotoStoragePort;
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
        $storage = new SpyDeleteDoAssetStorage();
        $handler = new DeleteDoHandler($repository, $storage);

        $handler->handle(10);

        self::assertSame([10], $repository->deletedIds);
        self::assertSame(['/images/icons/DO/rioja_DO.png'], $storage->deletedDoLogos);
    }

    public function testItRejectsDeleteWhenDoHasAssociatedWines(): void
    {
        $repository = new SpyDeleteDoRepository(deletableIds: [10], associatedWineIds: [10]);
        $storage = new SpyDeleteDoAssetStorage();
        $handler = new DeleteDoHandler($repository, $storage);

        $this->expectException(DeleteDoHasAssociatedWines::class);
        $handler->handle(10);
        self::assertSame([], $repository->deletedIds);
        self::assertSame([], $storage->deletedDoLogos);
    }

    public function testItThrowsWhenDoDoesNotExist(): void
    {
        $repository = new SpyDeleteDoRepository(deletableIds: []);
        $storage = new SpyDeleteDoAssetStorage();
        $handler = new DeleteDoHandler($repository, $storage);

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

    public function create(DenominationOfOrigin $do): int
    {
        return 0;
    }

    public function findById(int $id): ?DenominationOfOrigin
    {
        return new DenominationOfOrigin($id, 'DO '.$id, 'Region '.$id, Country::Spain, 'ES', 'rioja_DO.png', 'la_rioja.png');
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

final class SpyDeleteDoAssetStorage implements PhotoStoragePort
{
    /** @var list<string> */
    public array $deletedDoLogos = [];

    public function save(string $sourcePath, int $wineId, string $hash, string $extension): string
    {
        return 'saved_asset.png';
    }

    public function deleteByUrl(string $entity, string $url): void
    {
        $this->deletedDoLogos[] = $url;
    }

    public function deleteDirectory(string $entity, int $wineId): void
    {
    }
}
