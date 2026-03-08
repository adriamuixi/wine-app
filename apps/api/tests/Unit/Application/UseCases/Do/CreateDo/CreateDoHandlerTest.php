<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Do\CreateDo;

use App\Application\UseCases\Do\CreateDo\CreateDoCommand;
use App\Application\UseCases\Do\CreateDo\CreateDoHandler;
use App\Application\UseCases\Do\CreateDo\CreateDoValidationException;
use App\Domain\Enum\Country;
use App\Domain\Model\DenominationOfOrigin;
use App\Domain\Repository\DoRepository;
use PHPUnit\Framework\TestCase;

final class CreateDoHandlerTest extends TestCase
{
    public function testItCreatesDoAndReturnsId(): void
    {
        $repository = new SpyCreateDoRepository();
        $handler = new CreateDoHandler($repository);

        $result = $handler->handle(new CreateDoCommand(
            name: 'Montsant',
            region: 'Catalunya',
            country: Country::Spain,
            countryCode: 'es',
            doLogo: 'montsant_DO.png',
        ));

        self::assertSame(77, $result->id);
        self::assertSame('Montsant', $repository->createdDo?->name);
        self::assertSame('ES', $repository->createdDo?->countryCode);
        self::assertNull($repository->createdDo?->regionLogo);
    }

    public function testItRejectsInvalidCountryCodeLength(): void
    {
        $handler = new CreateDoHandler(new SpyCreateDoRepository());

        $this->expectException(CreateDoValidationException::class);
        $this->expectExceptionMessage('country_code must have 2 characters.');

        $handler->handle(new CreateDoCommand(
            name: 'Montsant',
            region: 'Catalunya',
            country: Country::Spain,
            countryCode: 'ESP',
            doLogo: null,
        ));
    }
}

final class SpyCreateDoRepository implements DoRepository
{
    public ?DenominationOfOrigin $createdDo = null;

    public function create(DenominationOfOrigin $do): int
    {
        $this->createdDo = $do;

        return 77;
    }

    public function findById(int $id): ?DenominationOfOrigin
    {
        return null;
    }

    public function findCountryById(int $id): ?Country
    {
        return null;
    }

    public function findAll(array $sortFields = []): array
    {
        return [];
    }

    public function update(DenominationOfOrigin $do): bool
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
