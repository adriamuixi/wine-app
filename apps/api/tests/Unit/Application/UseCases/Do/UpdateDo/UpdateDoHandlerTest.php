<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Do\UpdateDo;

use App\Application\UseCases\Do\UpdateDo\UpdateDoCommand;
use App\Application\UseCases\Do\UpdateDo\UpdateDoHandler;
use App\Application\UseCases\Do\UpdateDo\UpdateDoNotFound;
use App\Application\UseCases\Do\UpdateDo\UpdateDoValidationException;
use App\Application\UseCases\Photo\PhotoInputGuard;
use App\Domain\Enum\Country;
use App\Domain\Model\DenominationOfOrigin;
use App\Domain\Repository\DoRepository;
use PHPUnit\Framework\TestCase;

final class UpdateDoHandlerTest extends TestCase
{
    public function testItUpdatesExistingDo(): void
    {
        $repository = new SpyDoRepository(updatableIds: [10]);
        $handler = new UpdateDoHandler($repository, new PhotoInputGuard());

        $handler->handle(new UpdateDoCommand(
            doId: 10,
            name: 'Updated DO',
            region: null,
            country: null,
            countryCode: null,
            doLogo: null,
            regionLogo: null,
            provided: ['name' => true],
        ));

        self::assertSame(10, $repository->lastDo?->id);
        self::assertSame('Updated DO', $repository->lastDo?->name);
        self::assertSame('Region 10', $repository->lastDo?->region);
        self::assertNull($repository->lastDo?->regionLogo);
    }

    public function testItRejectsRegionLogoUpdate(): void
    {
        $handler = new UpdateDoHandler(new SpyDoRepository(updatableIds: [10]), new PhotoInputGuard());

        $this->expectException(UpdateDoValidationException::class);
        $this->expectExceptionMessage('region_logo cannot be updated via this endpoint.');
        $handler->handle(new UpdateDoCommand(
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
        $handler = new UpdateDoHandler(new SpyDoRepository(updatableIds: [10]), new PhotoInputGuard());

        $this->expectException(UpdateDoValidationException::class);
        $handler->handle(new UpdateDoCommand(
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
        $handler = new UpdateDoHandler(new SpyDoRepository(updatableIds: [10]), new PhotoInputGuard());

        $this->expectException(UpdateDoValidationException::class);
        $handler->handle(new UpdateDoCommand(
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
        $handler = new UpdateDoHandler(new SpyDoRepository(updatableIds: [10]), new PhotoInputGuard());

        $this->expectException(UpdateDoValidationException::class);
        $this->expectExceptionMessage('do_logo must use an image extension: jpg, jpeg, png, webp, gif, avif.');
        $handler->handle(new UpdateDoCommand(
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
        $handler = new UpdateDoHandler(new SpyDoRepository(updatableIds: []), new PhotoInputGuard());

        $this->expectException(UpdateDoNotFound::class);
        $handler->handle(new UpdateDoCommand(
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

final class SpyDoRepository implements DoRepository
{
    public ?DenominationOfOrigin $lastDo = null;

    /**
     * @param list<int> $updatableIds
     */
    public function __construct(private readonly array $updatableIds)
    {
    }

    public function create(DenominationOfOrigin $do): int
    {
        return 0;
    }

    public function findById(int $id): ?DenominationOfOrigin
    {
        return new DenominationOfOrigin($id, 'DO '.$id, 'Region '.$id, Country::Spain, 'ES', null, null);
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
    ): array
    {
        return [];
    }

    public function update(DenominationOfOrigin $do): bool
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
