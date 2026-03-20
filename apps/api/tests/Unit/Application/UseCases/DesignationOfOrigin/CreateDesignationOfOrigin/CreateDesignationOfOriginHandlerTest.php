<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOrigin;

use App\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOrigin\CreateDesignationOfOriginCommand;
use App\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOrigin\CreateDesignationOfOriginHandler;
use App\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOrigin\CreateDesignationOfOriginValidationException;
use App\Application\UseCases\Photo\PhotoInputGuard;
use App\Domain\Enum\Country;
use App\Domain\Model\DesignationOfOrigin;
use App\Domain\Repository\DesignationOfOriginRepository;
use PHPUnit\Framework\TestCase;

final class CreateDesignationOfOriginHandlerTest extends TestCase
{
    public function testItCreatesDoAndReturnsId(): void
    {
        $repository = new SpyCreateDesignationOfOriginRepository();
        $handler = new CreateDesignationOfOriginHandler($repository, new PhotoInputGuard());

        $result = $handler->handle(new CreateDesignationOfOriginCommand(
            name: 'Montsant',
            region: 'Catalunya',
            country: Country::Spain,
            countryCode: 'es',
            doLogo: 'montsant_DO.png',
            mapData: ['lat' => 41.3, 'lng' => 0.7, 'zoom' => 7],
        ));

        self::assertSame(77, $result->id);
        self::assertSame('Montsant', $repository->createdDo?->name);
        self::assertSame('ES', $repository->createdDo?->countryCode);
        self::assertNull($repository->createdDo?->regionLogo);
        self::assertSame(41.3, $repository->createdDo?->mapData['lat']);
        self::assertSame(0.7, $repository->createdDo?->mapData['lng']);
        self::assertSame(7, $repository->createdDo?->mapData['zoom']);
    }

    public function testItRejectsInvalidCountryCodeLength(): void
    {
        $handler = new CreateDesignationOfOriginHandler(new SpyCreateDesignationOfOriginRepository(), new PhotoInputGuard());

        $this->expectException(CreateDesignationOfOriginValidationException::class);
        $this->expectExceptionMessage('country_code must have 2 characters.');

        $handler->handle(new CreateDesignationOfOriginCommand(
            name: 'Montsant',
            region: 'Catalunya',
            country: Country::Spain,
            countryCode: 'ESP',
            doLogo: null,
        ));
    }

    public function testItRejectsInvalidDoLogoExtension(): void
    {
        $handler = new CreateDesignationOfOriginHandler(new SpyCreateDesignationOfOriginRepository(), new PhotoInputGuard());

        $this->expectException(CreateDesignationOfOriginValidationException::class);
        $this->expectExceptionMessage('do_logo must use an image extension: jpg, jpeg, png, webp, gif, avif.');

        $handler->handle(new CreateDesignationOfOriginCommand(
            name: 'Montsant',
            region: 'Catalunya',
            country: Country::Spain,
            countryCode: 'ES',
            doLogo: 'montsant_DO.pdf',
        ));
    }
}

final class SpyCreateDesignationOfOriginRepository implements DesignationOfOriginRepository
{
    public ?DesignationOfOrigin $createdDo = null;

    public function create(DesignationOfOrigin $do): int
    {
        $this->createdDo = $do;

        return 77;
    }

    public function findById(int $id): ?DesignationOfOrigin
    {
        return null;
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
        array $userIds = [],
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
        return false;
    }

    public function hasAssociatedWines(int $id): bool
    {
        return false;
    }
}
