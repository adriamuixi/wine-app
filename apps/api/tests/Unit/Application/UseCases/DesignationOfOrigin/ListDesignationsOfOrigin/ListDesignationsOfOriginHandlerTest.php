<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\DesignationOfOrigin\ListDesignationsOfOrigin;

use App\Application\UseCases\DesignationOfOrigin\ListDesignationsOfOrigin\ListDesignationsOfOriginHandler;
use App\Application\UseCases\DesignationOfOrigin\ListDesignationsOfOrigin\ListDesignationsOfOriginQuery;
use App\Application\UseCases\DesignationOfOrigin\ListDesignationsOfOrigin\ListDesignationsOfOriginSort;
use App\Domain\Enum\Country;
use App\Domain\Model\DesignationOfOrigin;
use App\Domain\Repository\DesignationOfOriginRepository;
use PHPUnit\Framework\TestCase;

final class ListDesignationsOfOriginHandlerTest extends TestCase
{
    public function testItReturnsAllDosFromRepository(): void
    {
        $repository = new InMemoryDesignationOfOriginRepository();
        $handler = new ListDesignationsOfOriginHandler($repository);
        $items = $handler->handle();

        self::assertCount(2, $items);
        self::assertSame('Rioja', $items[0]->name);
        self::assertSame('La Rioja', $items[0]->region);
        self::assertSame(Country::Spain, $items[0]->country);
        self::assertSame('rioja_DO.png', $items[0]->doLogo);
        self::assertSame(ListDesignationsOfOriginSort::DEFAULT_ORDER, $repository->lastSortFields);
    }

    public function testItPassesCustomSortOrderToRepository(): void
    {
        $repository = new InMemoryDesignationOfOriginRepository();
        $handler = new ListDesignationsOfOriginHandler($repository);

        $handler->handle(new ListDesignationsOfOriginQuery([
            ListDesignationsOfOriginSort::NAME,
            ListDesignationsOfOriginSort::COUNTRY,
            ListDesignationsOfOriginSort::REGION,
        ]));

        self::assertSame(
            [ListDesignationsOfOriginSort::NAME, ListDesignationsOfOriginSort::COUNTRY, ListDesignationsOfOriginSort::REGION],
            $repository->lastSortFields,
        );
    }

    public function testItPassesFiltersToRepository(): void
    {
        $repository = new InMemoryDesignationOfOriginRepository();
        $handler = new ListDesignationsOfOriginHandler($repository);

        $handler->handle(new ListDesignationsOfOriginQuery(
            sortFields: ListDesignationsOfOriginSort::DEFAULT_ORDER,
            name: 'Rio',
            country: Country::Spain,
            region: 'Rioja',
        ));

        self::assertSame('Rio', $repository->lastNameFilter);
        self::assertSame(Country::Spain, $repository->lastCountryFilter);
        self::assertSame('Rioja', $repository->lastRegionFilter);
    }

    public function testItPassesUserIdsFilterToRepository(): void
    {
        $repository = new InMemoryDesignationOfOriginRepository();
        $handler = new ListDesignationsOfOriginHandler($repository);

        $handler->handle(new ListDesignationsOfOriginQuery(
            sortFields: ListDesignationsOfOriginSort::DEFAULT_ORDER,
            userIds: [1, 2],
        ));

        self::assertSame([1, 2], $repository->lastUserIdsFilter);
    }
}

final class InMemoryDesignationOfOriginRepository implements DesignationOfOriginRepository
{
    /** @var list<string> */
    public array $lastSortFields = [];
    public ?string $lastNameFilter = null;
    public ?Country $lastCountryFilter = null;
    public ?string $lastRegionFilter = null;
    /** @var list<int> */
    public array $lastUserIdsFilter = [];

    public function create(DesignationOfOrigin $do): int
    {
        return 0;
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
        $this->lastSortFields = $sortFields;
        $this->lastNameFilter = $name;
        $this->lastCountryFilter = $country;
        $this->lastRegionFilter = $region;
        $this->lastUserIdsFilter = $userIds;

        return [
            new DesignationOfOrigin(1, 'Rioja', 'La Rioja', Country::Spain, 'ES', 'rioja_DO.png', 'la_rioja.png'),
            new DesignationOfOrigin(2, 'Bordeaux', 'Bordeaux', Country::France, 'FR', 'bordeaux_DO.png', 'bordeaux.png'),
        ];
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
