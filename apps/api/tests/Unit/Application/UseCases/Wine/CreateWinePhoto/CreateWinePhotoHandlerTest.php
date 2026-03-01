<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Wine\CreateWinePhoto;

use App\Application\Ports\WinePhotoStoragePort;
use App\Domain\Repository\WinePhotoRepository;
use App\Domain\Repository\WineRepository;
use App\Application\UseCases\Wine\CreateWinePhoto\CreateWinePhotoCommand;
use App\Application\UseCases\Wine\CreateWinePhoto\CreateWinePhotoHandler;
use App\Application\UseCases\Wine\CreateWinePhoto\CreateWinePhotoNotFound;
use App\Application\UseCases\Wine\CreateWinePhoto\CreateWinePhotoValidationException;
use App\Domain\Model\WinePhoto;
use App\Application\UseCases\Wine\CreateWine\CreateWineCommand;
use App\Domain\Model\Wine;
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
        $photoStorage = new SpyWinePhotoStorage();
        $handler = new CreateWinePhotoHandler($wineRepo, $photoRepo, $photoStorage);
        $result = $handler->handle(new CreateWinePhotoCommand(1, WinePhotoType::Bottle, $tmp, 'bottle.jpg', 12));

        self::assertSame(55, $result->id);
        self::assertSame('/images/wines/1/hash123.jpg', $result->url);
        self::assertSame('jpg', $result->extension);
        self::assertSame('/images/wines/1/hash123.jpg', $photoStorage->savedUrl);
    }

    public function testItThrowsWhenWineDoesNotExist(): void
    {
        $tmp = tempnam(sys_get_temp_dir(), 'wine-photo-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, 'image-content');

        $handler = new CreateWinePhotoHandler(
            new SpyWineRepository(existingIds: []),
            new SpyWinePhotoRepository(),
            new SpyWinePhotoStorage(),
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
            new SpyWinePhotoStorage(),
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
        $photoStorage = new SpyWinePhotoStorage();
        $photoRepo->existing = new WinePhoto(77, '/images/wines/1/old.jpg', WinePhotoType::Bottle);
        $handler = new CreateWinePhotoHandler($wineRepo, $photoRepo, $photoStorage);
        $result = $handler->handle(new CreateWinePhotoCommand(1, WinePhotoType::Bottle, $tmp, 'bottle.jpg', 24));

        self::assertSame(77, $result->id);
        self::assertSame('/images/wines/1/old.jpg', $photoStorage->deletedUrl);
        self::assertSame(77, $photoRepo->updatedId);
    }
}

final class SpyWineRepository implements WineRepository
{
    /** @param list<int> $existingIds */
    public function __construct(private readonly array $existingIds)
    {
    }

    public function create(CreateWineCommand $command, ?Country $country): int
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
    public ?WinePhoto $existing = null;
    public ?int $updatedId = null;

    public function findByWineAndType(int $wineId, WinePhotoType $type): ?WinePhoto
    {
        return $this->existing;
    }

    public function create(
        int $wineId,
        WinePhoto $photo,
    ): int {
        return 55;
    }

    public function update(WinePhoto $photo): void
    {
        $this->updatedId = $photo->id;
    }

    public function findByWineId(int $wineId): array
    {
        return [];
    }
}

final class SpyWinePhotoStorage implements WinePhotoStoragePort
{
    public ?string $savedUrl = null;
    public ?string $deletedUrl = null;

    public function save(string $sourcePath, int $wineId, string $hash, string $extension): string
    {
        $this->savedUrl = '/images/wines/'.$wineId.'/hash123.'.$extension;

        return $this->savedUrl;
    }

    public function deleteByUrl(string $url): void
    {
        $this->deletedUrl = $url;
    }

    public function deleteWineDirectory(int $wineId): void
    {
    }
}
