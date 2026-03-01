<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Wine\CreatePhoto;

use App\Domain\Repository\WinePhotoRepository;
use App\Domain\Repository\WineRepository;
use App\Application\UseCases\Wine\CreatePhoto\CreateWinePhotoCommand;
use App\Application\UseCases\Wine\CreatePhoto\CreateWinePhotoHandler;
use App\Application\UseCases\Wine\CreatePhoto\CreateWinePhotoNotFound;
use App\Application\UseCases\Wine\CreatePhoto\CreateWinePhotoValidationException;
use App\Domain\Model\WinePhoto;
use App\Application\UseCases\Wine\CreateWine\CreateWineCommand;
use App\Application\UseCases\Wine\GetWine\WineDetailsView;
use App\Application\UseCases\Wine\ListWines\ListWinesQuery;
use App\Application\UseCases\Wine\ListWines\ListWinesResult;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineCommand;
use App\Domain\Enum\Country;
use App\Domain\Enum\WinePhotoType;
use PHPUnit\Framework\TestCase;

final class CreateWinePhotoHandlerTest extends TestCase
{
    public function testItCreatesPhotoForWine(): void
    {
        $tmp = tempnam(sys_get_temp_dir(), 'wine-photo-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, 'image-content');

        $wineRepo = new SpyWineRepository(existingIds: [1]);
        $photoRepo = new SpyWinePhotoRepository();
        $handler = new CreateWinePhotoHandler($wineRepo, $photoRepo);
        $result = $handler->handle(new CreateWinePhotoCommand(1, WinePhotoType::Bottle, $tmp, 'bottle.jpg', 12));

        self::assertSame(55, $result->id);
        self::assertSame('/images/wines/1/hash123.jpg', $result->url);
        self::assertSame('jpg', $result->extension);
    }

    public function testItThrowsWhenWineDoesNotExist(): void
    {
        $tmp = tempnam(sys_get_temp_dir(), 'wine-photo-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, 'image-content');

        $handler = new CreateWinePhotoHandler(
            new SpyWineRepository(existingIds: []),
            new SpyWinePhotoRepository(),
        );

        $this->expectException(CreateWinePhotoNotFound::class);
        $handler->handle(new CreateWinePhotoCommand(99, WinePhotoType::Bottle, $tmp, 'bottle.jpg', 12));
    }

    public function testItThrowsForEmptyFile(): void
    {
        $tmp = tempnam(sys_get_temp_dir(), 'wine-photo-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, '');

        $handler = new CreateWinePhotoHandler(
            new SpyWineRepository(existingIds: [1]),
            new SpyWinePhotoRepository(),
        );

        $this->expectException(CreateWinePhotoValidationException::class);
        $handler->handle(new CreateWinePhotoCommand(1, WinePhotoType::Bottle, $tmp, 'bottle.jpg', 0));
    }

    public function testItReplacesExistingTypePhoto(): void
    {
        $tmp = tempnam(sys_get_temp_dir(), 'wine-photo-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, 'new-image-content');

        $wineRepo = new SpyWineRepository(existingIds: [1]);
        $photoRepo = new SpyWinePhotoRepository();
        $photoRepo->existing = new WinePhoto(77, '/images/wines/1/old.jpg', WinePhotoType::Bottle);
        $handler = new CreateWinePhotoHandler($wineRepo, $photoRepo);
        $result = $handler->handle(new CreateWinePhotoCommand(1, WinePhotoType::Bottle, $tmp, 'bottle.jpg', 24));

        self::assertSame(77, $result->id);
        self::assertSame('/images/wines/1/old.jpg', $photoRepo->deletedUrl);
        self::assertSame(77, $photoRepo->updatedId);
    }
}

final class SpyWineRepository implements WineRepository
{
    /** @param list<int> $existingIds */
    public function __construct(private readonly array $existingIds)
    {
    }

    public function createWithRelations(CreateWineCommand $command, ?Country $country): int
    {
        return 1;
    }

    public function updatePartial(UpdateWineCommand $command): bool
    {
        return false;
    }

    public function deleteById(int $id): bool
    {
        return false;
    }

    public function existsById(int $id): bool
    {
        return in_array($id, $this->existingIds, true);
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
    public ?WinePhoto $existing = null;
    public ?int $updatedId = null;
    public ?string $deletedUrl = null;

    public function findByWineAndType(int $wineId, WinePhotoType $type): ?WinePhoto
    {
        return $this->existing;
    }

    public function createForWine(
        int $wineId,
        WinePhotoType $type,
        string $url,
        string $hash,
        int $size,
        string $extension,
    ): int {
        return 55;
    }

    public function updateById(
        int $id,
        string $url,
        string $hash,
        int $size,
        string $extension,
    ): void {
        $this->updatedId = $id;
    }

    public function findUrlsByWineId(int $wineId): array
    {
        return [];
    }

    public function save(string $sourcePath, int $wineId, string $hash, string $extension): string
    {
        return '/images/wines/'.$wineId.'/hash123.'.$extension;
    }

    public function deleteByUrl(string $url): void
    {
        $this->deletedUrl = $url;
    }

    public function deleteWineDirectory(int $wineId): void
    {
    }
}
