<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Do\CreateDoAsset;

use App\Application\Ports\PhotoStoragePort;
use App\Application\UseCases\Do\CreateDoAsset\CreateDoAssetCommand;
use App\Application\UseCases\Do\CreateDoAsset\CreateDoAssetHandler;
use App\Application\UseCases\Do\CreateDoAsset\CreateDoAssetNotFound;
use App\Application\UseCases\Do\CreateDoAsset\CreateDoAssetValidationException;
use App\Application\UseCases\Photo\PhotoInputGuard;
use App\Domain\Enum\Country;
use App\Domain\Enum\DoAssetType;
use App\Domain\Model\DenominationOfOrigin;
use App\Domain\Repository\DoRepository;
use PHPUnit\Framework\TestCase;

final class CreateDoAssetHandlerTest extends TestCase
{
    public function testItCreatesDoLogoAsset(): void
    {
        $tmp = tempnam(sys_get_temp_dir(), 'do-asset-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, 'image-content');

        $repository = new InMemoryDoRepository([1]);
        $storage = new SpyDoAssetStorage();
        $handler = new CreateDoAssetHandler($repository, $storage, new PhotoInputGuard());

        $result = $handler->handle(new CreateDoAssetCommand(1, DoAssetType::DoLogo, $tmp, 'rioja.png', 12));

        self::assertSame(1, $result->doId);
        self::assertSame('saved_asset.png', $result->filename);
        self::assertSame('/images/icons/DO/saved_asset.png', $result->url);
        self::assertSame('saved_asset.png', $repository->lastUpdatedDo?->doLogo);
        self::assertSame('la_rioja.png', $repository->lastUpdatedDo?->regionLogo);
    }

    public function testItCreatesRegionLogoAsset(): void
    {
        $tmp = tempnam(sys_get_temp_dir(), 'do-asset-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, 'image-content');

        $repository = new InMemoryDoRepository([1]);
        $storage = new SpyDoAssetStorage();
        $handler = new CreateDoAssetHandler($repository, $storage, new PhotoInputGuard());

        $result = $handler->handle(new CreateDoAssetCommand(1, DoAssetType::RegionLogo, $tmp, 'murcia.png', 12));

        self::assertSame('/images/flags/regions/saved_asset.png', $result->url);
        self::assertSame('rioja_DO.png', $repository->lastUpdatedDo?->doLogo);
        self::assertSame('saved_asset.png', $repository->lastUpdatedDo?->regionLogo);
    }

    public function testItThrowsWhenDoDoesNotExist(): void
    {
        $tmp = tempnam(sys_get_temp_dir(), 'do-asset-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, 'image-content');

        $handler = new CreateDoAssetHandler(new InMemoryDoRepository([]), new SpyDoAssetStorage(), new PhotoInputGuard());

        $this->expectException(CreateDoAssetNotFound::class);
        $handler->handle(new CreateDoAssetCommand(99, DoAssetType::DoLogo, $tmp, 'rioja.png', 12));
    }

    public function testItThrowsForEmptyFile(): void
    {
        $tmp = tempnam(sys_get_temp_dir(), 'do-asset-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, '');

        $handler = new CreateDoAssetHandler(new InMemoryDoRepository([1]), new SpyDoAssetStorage(), new PhotoInputGuard());

        $this->expectException(CreateDoAssetValidationException::class);
        $handler->handle(new CreateDoAssetCommand(1, DoAssetType::DoLogo, $tmp, 'rioja.png', 0));
    }

    public function testItThrowsForUnsupportedImageExtension(): void
    {
        $tmp = tempnam(sys_get_temp_dir(), 'do-asset-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, 'image-content');

        $handler = new CreateDoAssetHandler(new InMemoryDoRepository([1]), new SpyDoAssetStorage(), new PhotoInputGuard());

        $this->expectException(CreateDoAssetValidationException::class);
        $this->expectExceptionMessage('Unsupported image extension. Allowed: jpg, jpeg, png, webp, gif, avif.');
        $handler->handle(new CreateDoAssetCommand(1, DoAssetType::DoLogo, $tmp, 'rioja.pdf', 10));
    }
}

final class InMemoryDoRepository implements DoRepository
{
    public ?DenominationOfOrigin $lastUpdatedDo = null;

    /** @param list<int> $existingIds */
    public function __construct(private readonly array $existingIds)
    {
    }

    public function create(DenominationOfOrigin $do): int
    {
        return 0;
    }

    public function findById(int $id): ?DenominationOfOrigin
    {
        if (!in_array($id, $this->existingIds, true)) {
            return null;
        }

        return new DenominationOfOrigin($id, 'Rioja', 'La Rioja', Country::Spain, 'ES', 'rioja_DO.png', 'la_rioja.png');
    }

    public function findCountryById(int $id): ?Country
    {
        return null;
    }

    public function findAll(
        array $sortFields = [],
        ?string $name = null,
        ?Country $country = null,
        ?string $region = null,
    ): array
    {
        return [];
    }

    public function update(DenominationOfOrigin $do): bool
    {
        if (!in_array($do->id, $this->existingIds, true)) {
            return false;
        }

        $this->lastUpdatedDo = $do;

        return true;
    }

    public function deleteById(int $id): bool
    {
        return false;
    }

    public function hasAssociatedWines(int $id): bool
    {
        return false;
    }
}

final class SpyDoAssetStorage implements PhotoStoragePort
{
    public function save(string $sourcePath, int $wineId, string $hash, string $extension): string
    {
        return 'saved_asset.png';
    }

    public function deleteByUrl(string $entity, string $url): void
    {
    }

    public function deleteDirectory(string $entity, int $wineId): void
    {
    }
}
