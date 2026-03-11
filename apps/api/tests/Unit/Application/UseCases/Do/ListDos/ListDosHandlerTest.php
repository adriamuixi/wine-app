<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Do\ListDos;

use App\Application\UseCases\Do\ListDos\ListDosHandler;
use App\Application\UseCases\Do\ListDos\ListDosQuery;
use App\Application\UseCases\Do\ListDos\ListDosSort;
use App\Domain\Enum\Country;
use App\Domain\Model\DenominationOfOrigin;
use App\Domain\Repository\DoRepository;
use PHPUnit\Framework\TestCase;

final class ListDosHandlerTest extends TestCase
{
    public function testItReturnsAllDosFromRepository(): void
    {
        $repository = new InMemoryDoRepository();
        $handler = new ListDosHandler($repository);
        $items = $handler->handle();

        self::assertCount(2, $items);
        self::assertSame('Rioja', $items[0]->name);
        self::assertSame('La Rioja', $items[0]->region);
        self::assertSame(Country::Spain, $items[0]->country);
        self::assertSame('rioja_DO.png', $items[0]->doLogo);
        self::assertSame(ListDosSort::DEFAULT_ORDER, $repository->lastSortFields);
    }

    public function testItPassesCustomSortOrderToRepository(): void
    {
        $repository = new InMemoryDoRepository();
        $handler = new ListDosHandler($repository);

        $handler->handle(new ListDosQuery([
            ListDosSort::NAME,
            ListDosSort::COUNTRY,
            ListDosSort::REGION,
        ]));

        self::assertSame(
            [ListDosSort::NAME, ListDosSort::COUNTRY, ListDosSort::REGION],
            $repository->lastSortFields,
        );
    }

    public function testItPassesFiltersToRepository(): void
    {
        $repository = new InMemoryDoRepository();
        $handler = new ListDosHandler($repository);

        $handler->handle(new ListDosQuery(
            sortFields: ListDosSort::DEFAULT_ORDER,
            name: 'Rio',
            country: Country::Spain,
            region: 'Rioja',
        ));

        self::assertSame('Rio', $repository->lastNameFilter);
        self::assertSame(Country::Spain, $repository->lastCountryFilter);
        self::assertSame('Rioja', $repository->lastRegionFilter);
    }
}

final class InMemoryDoRepository implements DoRepository
{
    /** @var list<string> */
    public array $lastSortFields = [];
    public ?string $lastNameFilter = null;
    public ?Country $lastCountryFilter = null;
    public ?string $lastRegionFilter = null;

    public function create(DenominationOfOrigin $do): int
    {
        return 0;
    }

    public function findById(int $id): ?DenominationOfOrigin
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
    ): array
    {
        $this->lastSortFields = $sortFields;
        $this->lastNameFilter = $name;
        $this->lastCountryFilter = $country;
        $this->lastRegionFilter = $region;

        return [
            new DenominationOfOrigin(1, 'Rioja', 'La Rioja', Country::Spain, 'ES', 'rioja_DO.png', 'la_rioja.png'),
            new DenominationOfOrigin(2, 'Bordeaux', 'Bordeaux', Country::France, 'FR', 'bordeaux_DO.png', 'bordeaux.png'),
        ];
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
