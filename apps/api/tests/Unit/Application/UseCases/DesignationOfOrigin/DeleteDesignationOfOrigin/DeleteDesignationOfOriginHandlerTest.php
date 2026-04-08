<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\DesignationOfOrigin\DeleteDesignationOfOrigin;

use App\Application\Ports\PhotoStoragePort;
use App\Application\UseCases\DesignationOfOrigin\DeleteDesignationOfOrigin\DeleteDesignationOfOriginHandler;
use App\Application\UseCases\DesignationOfOrigin\DeleteDesignationOfOrigin\DeleteDesignationOfOriginHasAssociatedWines;
use App\Application\UseCases\DesignationOfOrigin\DeleteDesignationOfOrigin\DeleteDesignationOfOriginNotFound;
use App\Domain\Enum\Country;
use App\Domain\Model\DesignationOfOrigin;
use App\Domain\Repository\DesignationOfOriginRepository;
use PHPUnit\Framework\TestCase;

final class DeleteDesignationOfOriginHandlerTest extends TestCase
{
    public function testItDeletesExistingDo(): void
    {
        $repository = new SpyDeleteDesignationOfOriginRepository(deletableIds: [10]);
        $storage = new SpyDeleteDesignationOfOriginAssetStorage();
        $handler = new DeleteDesignationOfOriginHandler($repository, $storage);

        $handler->handle(10);

        self::assertSame([10], $repository->deletedIds);
        self::assertSame(['/images/icons/DO/rioja_DO.png'], $storage->deletedDoLogos);
    }

    public function testItRejectsDeleteWhenDoHasAssociatedWines(): void
    {
        $repository = new SpyDeleteDesignationOfOriginRepository(deletableIds: [10], associatedWineIds: [10]);
        $storage = new SpyDeleteDesignationOfOriginAssetStorage();
        $handler = new DeleteDesignationOfOriginHandler($repository, $storage);

        $this->expectException(DeleteDesignationOfOriginHasAssociatedWines::class);
        $handler->handle(10);
        self::assertSame([], $repository->deletedIds);
        self::assertSame([], $storage->deletedDoLogos);
    }

    public function testItThrowsWhenDoDoesNotExist(): void
    {
        $repository = new SpyDeleteDesignationOfOriginRepository(deletableIds: []);
        $storage = new SpyDeleteDesignationOfOriginAssetStorage();
        $handler = new DeleteDesignationOfOriginHandler($repository, $storage);

        $this->expectException(DeleteDesignationOfOriginNotFound::class);
        $handler->handle(99);
    }
}

final class SpyDeleteDesignationOfOriginRepository implements DesignationOfOriginRepository
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

    public function create(DesignationOfOrigin $do): int
    {
        return 0;
    }

    public function findById(int $id): ?DesignationOfOrigin
    {
        return new DesignationOfOrigin($id, 'DO '.$id, 'Region '.$id, Country::Spain, 'ES', 'rioja_DO.png', 'la_rioja.png');
    }

    public function findCountryById(int $id): ?Country
    {
        return Country::Spain;
    }

    public function findAll(
        array $sortFields = [],
        ?string $name = null,
        ?Country $country = null,
        ?string $region = null,
        array $userIds = [],
        ?bool $hasWines = null,
    ): array
    {
        return [];
    }

    public function update(DesignationOfOrigin $do): bool
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

final class SpyDeleteDesignationOfOriginAssetStorage implements PhotoStoragePort
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
