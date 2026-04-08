<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\DesignationOfOrigin\UpdateDesignationOfOrigin;

use App\Application\UseCases\DesignationOfOrigin\UpdateDesignationOfOrigin\UpdateDesignationOfOriginCommand;
use App\Application\UseCases\DesignationOfOrigin\UpdateDesignationOfOrigin\UpdateDesignationOfOriginHandler;
use App\Application\UseCases\DesignationOfOrigin\UpdateDesignationOfOrigin\UpdateDesignationOfOriginNotFound;
use App\Application\UseCases\DesignationOfOrigin\UpdateDesignationOfOrigin\UpdateDesignationOfOriginValidationException;
use App\Application\UseCases\Photo\PhotoInputGuard;
use App\Domain\Enum\Country;
use App\Domain\Model\DesignationOfOrigin;
use App\Domain\Repository\DesignationOfOriginRepository;
use PHPUnit\Framework\TestCase;

final class UpdateDesignationOfOriginHandlerTest extends TestCase
{
    public function testItUpdatesExistingDo(): void
    {
        $repository = new SpyDesignationOfOriginRepository(updatableIds: [10]);
        $handler = new UpdateDesignationOfOriginHandler($repository, new PhotoInputGuard());

        $handler->handle(new UpdateDesignationOfOriginCommand(
            doId: 10,
            name: 'Updated DO',
            region: null,
            country: null,
            countryCode: null,
            doLogo: null,
            regionLogo: null,
            provided: ['name' => true],
            mapData: null,
        ));

        self::assertSame(10, $repository->lastDo?->id);
        self::assertSame('Updated DO', $repository->lastDo?->name);
        self::assertSame('Region 10', $repository->lastDo?->region);
        self::assertNull($repository->lastDo?->regionLogo);
        self::assertSame(42.5, $repository->lastDo?->mapData['lat']);
        self::assertSame(-2.4, $repository->lastDo?->mapData['lng']);
    }

    public function testItUpdatesMapDataWhenProvided(): void
    {
        $repository = new SpyDesignationOfOriginRepository(updatableIds: [10]);
        $handler = new UpdateDesignationOfOriginHandler($repository, new PhotoInputGuard());

        $handler->handle(new UpdateDesignationOfOriginCommand(
            doId: 10,
            name: null,
            region: null,
            country: null,
            countryCode: null,
            doLogo: null,
            regionLogo: null,
            provided: ['map_data' => true],
            mapData: ['lat' => 40.11, 'lng' => -3.22, 'zoom' => 8],
        ));

        self::assertSame(40.11, $repository->lastDo?->mapData['lat']);
        self::assertSame(-3.22, $repository->lastDo?->mapData['lng']);
        self::assertSame(8, $repository->lastDo?->mapData['zoom']);
    }

    public function testItRejectsRegionLogoUpdate(): void
    {
        $handler = new UpdateDesignationOfOriginHandler(new SpyDesignationOfOriginRepository(updatableIds: [10]), new PhotoInputGuard());

        $this->expectException(UpdateDesignationOfOriginValidationException::class);
        $this->expectExceptionMessage('region_logo cannot be updated via this endpoint.');
        $handler->handle(new UpdateDesignationOfOriginCommand(
            doId: 10,
            name: null,
            region: null,
            country: null,
            countryCode: null,
            doLogo: null,
            regionLogo: 'updated_region.png',
            provided: ['region_logo' => true],
        ));
    }

    public function testItRejectsWhenNoFieldsProvided(): void
    {
        $handler = new UpdateDesignationOfOriginHandler(new SpyDesignationOfOriginRepository(updatableIds: [10]), new PhotoInputGuard());

        $this->expectException(UpdateDesignationOfOriginValidationException::class);
        $handler->handle(new UpdateDesignationOfOriginCommand(
            doId: 10,
            name: null,
            region: null,
            country: null,
            countryCode: null,
            doLogo: null,
            regionLogo: null,
            provided: [],
        ));
    }

    public function testItRejectsInvalidCountryCodeLength(): void
    {
        $handler = new UpdateDesignationOfOriginHandler(new SpyDesignationOfOriginRepository(updatableIds: [10]), new PhotoInputGuard());

        $this->expectException(UpdateDesignationOfOriginValidationException::class);
        $handler->handle(new UpdateDesignationOfOriginCommand(
            doId: 10,
            name: null,
            region: null,
            country: null,
            countryCode: 'ESP',
            doLogo: null,
            regionLogo: null,
            provided: ['country_code' => true],
        ));
    }

    public function testItRejectsInvalidDoLogoExtension(): void
    {
        $handler = new UpdateDesignationOfOriginHandler(new SpyDesignationOfOriginRepository(updatableIds: [10]), new PhotoInputGuard());

        $this->expectException(UpdateDesignationOfOriginValidationException::class);
        $this->expectExceptionMessage('do_logo must use an image extension: jpg, jpeg, png, webp, gif, avif.');
        $handler->handle(new UpdateDesignationOfOriginCommand(
            doId: 10,
            name: null,
            region: null,
            country: null,
            countryCode: null,
            doLogo: 'logo.txt',
            regionLogo: null,
            provided: ['do_logo' => true],
        ));
    }

    public function testItThrowsNotFoundWhenDoDoesNotExist(): void
    {
        $handler = new UpdateDesignationOfOriginHandler(new SpyDesignationOfOriginRepository(updatableIds: []), new PhotoInputGuard());

        $this->expectException(UpdateDesignationOfOriginNotFound::class);
        $handler->handle(new UpdateDesignationOfOriginCommand(
            doId: 77,
            name: 'Updated',
            region: null,
            country: null,
            countryCode: null,
            doLogo: null,
            regionLogo: null,
            provided: ['name' => true],
        ));
    }
}

final class SpyDesignationOfOriginRepository implements DesignationOfOriginRepository
{
    public ?DesignationOfOrigin $lastDo = null;

    /**
     * @param list<int> $updatableIds
     */
    public function __construct(private readonly array $updatableIds)
    {
    }

    public function create(DesignationOfOrigin $do): int
    {
        return 0;
    }

    public function findById(int $id): ?DesignationOfOrigin
    {
        return new DesignationOfOrigin(
            $id,
            'DO '.$id,
            'Region '.$id,
            Country::Spain,
            'ES',
            null,
            null,
            ['lat' => 42.5, 'lng' => -2.4, 'zoom' => 6],
        );
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
        $this->lastDo = $do;

        return in_array($do->id, $this->updatableIds, true);
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
