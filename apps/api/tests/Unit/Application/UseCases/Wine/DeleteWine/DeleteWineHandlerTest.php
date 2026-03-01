<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Wine\DeleteWine;

use App\Application\Ports\WinePhotoStoragePort;
use App\Domain\Repository\WinePhotoRepository;
use App\Domain\Repository\WineRepository;
use App\Application\UseCases\Wine\CreateWine\CreateWineCommand;
use App\Domain\Model\WinePhoto;
use App\Application\UseCases\Wine\DeleteWine\DeleteWineHandler;
use App\Application\UseCases\Wine\DeleteWine\WineNotFound;
use App\Domain\Model\Wine;
use App\Application\UseCases\Wine\ListWines\ListWinesQuery;
use App\Application\UseCases\Wine\ListWines\ListWinesResult;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineCommand;
use App\Domain\Enum\Country;
use App\Domain\Enum\WinePhotoType;
use RuntimeException;
use PHPUnit\Framework\TestCase;

final class DeleteWineHandlerTest extends TestCase
{
    public function testItDeletesExistingWine(): void
    {
        $repository = new SpyWineRepository([10]);
        $photos = new SpyWinePhotoRepository([
            new WinePhoto(1, '/images/wines/10/a.jpg', WinePhotoType::Bottle),
            new WinePhoto(2, '/images/wines/10/b.jpg', WinePhotoType::FrontLabel),
        ]);
        $storage = new SpyWinePhotoStorage();
        $handler = new DeleteWineHandler($repository, $photos, $storage);

        $handler->handle(10);

        self::assertSame([10], $repository->deletedIds);
        self::assertSame(['/images/wines/10/a.jpg', '/images/wines/10/b.jpg'], $storage->deletedUrls);
        self::assertSame([10], $storage->deletedDirectories);
    }

    public function testItThrowsWhenWineDoesNotExist(): void
    {
        $repository = new SpyWineRepository([]);
        $storage = new SpyWinePhotoStorage();
        $handler = new DeleteWineHandler($repository, new SpyWinePhotoRepository([]), $storage);

        $this->expectException(WineNotFound::class);
        $handler->handle(99);
        self::assertSame([], $storage->deletedUrls);
    }

    public function testItFailsFastWhenStorageDeleteFails(): void
    {
        $repository = new SpyWineRepository([10]);
        $photos = new SpyWinePhotoRepository([
            new WinePhoto(1, '/images/wines/10/a.jpg', WinePhotoType::Bottle),
            new WinePhoto(2, '/images/wines/10/b.jpg', WinePhotoType::FrontLabel),
        ]);
        $storage = new SpyWinePhotoStorage();
        $storage->failOnDeleteUrl = '/images/wines/10/a.jpg';
        $handler = new DeleteWineHandler($repository, $photos, $storage);

        $this->expectException(RuntimeException::class);
        $handler->handle(10);
    }
}

final class SpyWineRepository implements WineRepository
{
    /**
     * @var list<int>
     */
    public array $deletedIds = [];

    /**
     * @param list<int> $deletableIds
     */
    public function __construct(private readonly array $deletableIds)
    {
    }

    public function create(CreateWineCommand $command, ?Country $country): int
    {
        return 1;
    }

    public function deleteById(int $id): bool
    {
        $this->deletedIds[] = $id;

        return in_array($id, $this->deletableIds, true);
    }

    public function updatePartial(UpdateWineCommand $command): bool
    {
        return false;
    }

    public function existsById(int $id): bool
    {
        return false;
    }

    public function findById(int $id): ?Wine
    {
        return null;
    }

    public function findPaginated(ListWinesQuery $query): ListWinesResult
    {
        return new ListWinesResult([], $query->page, $query->limit, 0, 0);
    }
}

final class SpyWinePhotoRepository implements WinePhotoRepository
{
    /**
     * @param list<WinePhoto> $photos
     */
    public function __construct(private readonly array $photos)
    {
    }

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
        return $this->photos;
    }
}

final class SpyWinePhotoStorage implements WinePhotoStoragePort
{
    /** @var list<string> */
    public array $deletedUrls = [];

    /** @var list<int> */
    public array $deletedDirectories = [];
    public ?string $failOnDeleteUrl = null;

    public function save(string $sourcePath, int $wineId, string $hash, string $extension): string
    {
        return '/images/wines/'.$wineId.'/'.$hash.'.'.$extension;
    }

    public function deleteByUrl(string $url): void
    {
        if ($this->failOnDeleteUrl === $url) {
            throw new RuntimeException('delete failed');
        }
        $this->deletedUrls[] = $url;
    }

    public function deleteWineDirectory(int $wineId): void
    {
        $this->deletedDirectories[] = $wineId;
    }
}
