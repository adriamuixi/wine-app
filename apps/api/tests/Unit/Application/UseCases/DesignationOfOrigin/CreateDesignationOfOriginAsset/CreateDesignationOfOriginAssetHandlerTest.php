<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOriginAsset;

use App\Application\Ports\PhotoStoragePort;
use App\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOriginAsset\CreateDesignationOfOriginAssetCommand;
use App\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOriginAsset\CreateDesignationOfOriginAssetHandler;
use App\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOriginAsset\CreateDesignationOfOriginAssetNotFound;
use App\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOriginAsset\CreateDesignationOfOriginAssetValidationException;
use App\Application\UseCases\Photo\PhotoInputGuard;
use App\Domain\Enum\Country;
use App\Domain\Enum\DoAssetType;
use App\Domain\Model\DesignationOfOrigin;
use App\Domain\Repository\DesignationOfOriginRepository;
use PHPUnit\Framework\TestCase;

final class CreateDesignationOfOriginAssetHandlerTest extends TestCase
{
    public function testItCreatesDoLogoAsset(): void
    {
        $tmp = tempnam(sys_get_temp_dir(), 'do-asset-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, 'image-content');

        $repository = new InMemoryDesignationOfOriginRepository([1]);
        $storage = new SpyDesignationOfOriginAssetStorage();
        $handler = new CreateDesignationOfOriginAssetHandler($repository, $storage, new PhotoInputGuard());

        $result = $handler->handle(new CreateDesignationOfOriginAssetCommand(1, DoAssetType::DoLogo, $tmp, 'rioja.png', 12));

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

        $repository = new InMemoryDesignationOfOriginRepository([1]);
        $storage = new SpyDesignationOfOriginAssetStorage();
        $handler = new CreateDesignationOfOriginAssetHandler($repository, $storage, new PhotoInputGuard());

        $result = $handler->handle(new CreateDesignationOfOriginAssetCommand(1, DoAssetType::RegionLogo, $tmp, 'murcia.png', 12));

        self::assertSame('/images/flags/regions/saved_asset.png', $result->url);
        self::assertSame('rioja_DO.png', $repository->lastUpdatedDo?->doLogo);
        self::assertSame('saved_asset.png', $repository->lastUpdatedDo?->regionLogo);
    }

    public function testItThrowsWhenDoDoesNotExist(): void
    {
        $tmp = tempnam(sys_get_temp_dir(), 'do-asset-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, 'image-content');

        $handler = new CreateDesignationOfOriginAssetHandler(new InMemoryDesignationOfOriginRepository([]), new SpyDesignationOfOriginAssetStorage(), new PhotoInputGuard());

        $this->expectException(CreateDesignationOfOriginAssetNotFound::class);
        $handler->handle(new CreateDesignationOfOriginAssetCommand(99, DoAssetType::DoLogo, $tmp, 'rioja.png', 12));
    }

    public function testItThrowsForEmptyFile(): void
    {
        $tmp = tempnam(sys_get_temp_dir(), 'do-asset-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, '');

        $handler = new CreateDesignationOfOriginAssetHandler(new InMemoryDesignationOfOriginRepository([1]), new SpyDesignationOfOriginAssetStorage(), new PhotoInputGuard());

        $this->expectException(CreateDesignationOfOriginAssetValidationException::class);
        $handler->handle(new CreateDesignationOfOriginAssetCommand(1, DoAssetType::DoLogo, $tmp, 'rioja.png', 0));
    }

    public function testItThrowsForUnsupportedImageExtension(): void
    {
        $tmp = tempnam(sys_get_temp_dir(), 'do-asset-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, 'image-content');

        $handler = new CreateDesignationOfOriginAssetHandler(new InMemoryDesignationOfOriginRepository([1]), new SpyDesignationOfOriginAssetStorage(), new PhotoInputGuard());

        $this->expectException(CreateDesignationOfOriginAssetValidationException::class);
        $this->expectExceptionMessage('Unsupported image extension. Allowed: jpg, jpeg, png, webp, gif, avif.');
        $handler->handle(new CreateDesignationOfOriginAssetCommand(1, DoAssetType::DoLogo, $tmp, 'rioja.pdf', 10));
    }
}

final class InMemoryDesignationOfOriginRepository implements DesignationOfOriginRepository
{
    public ?DesignationOfOrigin $lastUpdatedDo = null;

    /** @param list<int> $existingIds */
    public function __construct(private readonly array $existingIds)
    {
    }

    public function create(DesignationOfOrigin $do): int
    {
        return 0;
    }

    public function findById(int $id): ?DesignationOfOrigin
    {
        if (!in_array($id, $this->existingIds, true)) {
            return null;
        }

        return new DesignationOfOrigin($id, 'Rioja', 'La Rioja', Country::Spain, 'ES', 'rioja_DO.png', 'la_rioja.png');
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

    public function update(DesignationOfOrigin $do): bool
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

final class SpyDesignationOfOriginAssetStorage implements PhotoStoragePort
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
