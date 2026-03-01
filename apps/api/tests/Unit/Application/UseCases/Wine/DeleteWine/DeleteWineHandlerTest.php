<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Wine\DeleteWine;

use App\Domain\Repository\WinePhotoRepository;
use App\Domain\Repository\WineRepository;
use App\Application\UseCases\Wine\CreateWine\CreateWineCommand;
use App\Domain\Model\WinePhoto;
use App\Application\UseCases\Wine\DeleteWine\DeleteWineHandler;
use App\Application\UseCases\Wine\DeleteWine\WineNotFound;
use App\Application\UseCases\Wine\GetWine\WineDetailsView;
use App\Application\UseCases\Wine\ListWines\ListWinesQuery;
use App\Application\UseCases\Wine\ListWines\ListWinesResult;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineCommand;
use App\Domain\Enum\Country;
use App\Domain\Enum\WinePhotoType;
use PHPUnit\Framework\TestCase;

final class DeleteWineHandlerTest extends TestCase
{
    public function testItDeletesExistingWine(): void
    {
        $repository = new SpyWineRepository([10]);
        $photos = new SpyWinePhotoRepository(['/images/wines/10/a.jpg', '/images/wines/10/b.jpg']);
        $handler = new DeleteWineHandler($repository, $photos);

        $handler->handle(10);

        self::assertSame([10], $repository->deletedIds);
        self::assertSame(['/images/wines/10/a.jpg', '/images/wines/10/b.jpg'], $photos->deletedUrls);
        self::assertSame([10], $photos->deletedDirectories);
    }

    public function testItThrowsWhenWineDoesNotExist(): void
    {
        $repository = new SpyWineRepository([]);
        $handler = new DeleteWineHandler($repository, new SpyWinePhotoRepository([]));

        $this->expectException(WineNotFound::class);
        $handler->handle(99);
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

    public function createWithRelations(CreateWineCommand $command, ?Country $country): int
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

    public function findDetailsById(int $id): ?WineDetailsView
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
     * @param list<string> $urls
     */
    public function __construct(private readonly array $urls)
    {
    }

    public function findByWineAndType(int $wineId, WinePhotoType $type): ?WinePhoto
    {
        return null;
    }

    public function createForWine(
        int $wineId,
        WinePhotoType $type,
        string $url,
        string $hash,
        int $size,
        string $extension,
    ): int {
        return 1;
    }

    public function updateById(
        int $id,
        string $url,
        string $hash,
        int $size,
        string $extension,
    ): void {
    }

    /** @var list<string> */
    public array $deletedUrls = [];

    /** @var list<int> */
    public array $deletedDirectories = [];

    public function save(string $sourcePath, int $wineId, string $hash, string $extension): string
    {
        return '/images/wines/'.$wineId.'/'.$hash.'.'.$extension;
    }

    public function deleteByUrl(string $url): void
    {
        $this->deletedUrls[] = $url;
    }

    public function deleteWineDirectory(int $wineId): void
    {
        $this->deletedDirectories[] = $wineId;
    }

    public function findUrlsByWineId(int $wineId): array
    {
        return $this->urls;
    }
}
