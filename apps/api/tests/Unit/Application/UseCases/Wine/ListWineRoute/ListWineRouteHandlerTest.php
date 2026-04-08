<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Wine\ListWineRoute;

use App\Application\UseCases\Wine\CreateWine\CreateWineCommand;
use App\Application\UseCases\Wine\ListWineRoute\ListWineRouteHandler;
use App\Application\UseCases\Wine\ListWineRoute\WineRouteStopView;
use App\Application\UseCases\Wine\ListWines\ListWinesQuery;
use App\Application\UseCases\Wine\ListWines\ListWinesResult;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineCommand;
use App\Domain\Enum\Country;
use App\Domain\Model\Wine;
use App\Domain\Repository\WineRepository;
use PHPUnit\Framework\TestCase;

final class ListWineRouteHandlerTest extends TestCase
{
    public function testItReturnsChronologicalRouteStopsFromRepository(): void
    {
        $repository = new InMemoryWineRouteRepository();
        $handler = new ListWineRouteHandler($repository);

        $result = $handler->handle();

        self::assertCount(2, $result->items);
        self::assertSame(701, $result->items[0]->purchaseId);
        self::assertSame('Route Demo 1', $result->items[0]->wineName);
        self::assertSame('2026-01-02T10:00:00+00:00', $result->items[0]->purchasedAt);
    }
}

final class InMemoryWineRouteRepository implements WineRepository
{
    public function create(CreateWineCommand $command, ?Country $country): int
    {
        return 0;
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
        return false;
    }

    public function findById(int $id): ?Wine
    {
        return null;
    }

    public function findPaginated(ListWinesQuery $query): ListWinesResult
    {
        return new ListWinesResult([], 1, 20, 0, 0);
    }

    public function listRouteStops(): array
    {
        return [
            new WineRouteStopView(
                purchaseId: 701,
                purchasedAt: '2026-01-02T10:00:00+00:00',
                pricePaid: 17.5,
                wineId: 31,
                wineName: 'Route Demo 1',
                winery: 'Demo Winery',
                wineType: 'red',
                country: 'spain',
                doId: 9,
                doName: 'Montsant',
                doLogo: 'montsant.png',
                regionLogo: 'catalunya.png',
                placeId: 81,
                placeName: 'Shop 1',
                placeAddress: null,
                placeCity: 'Barcelona',
                placeCountry: 'spain',
                lat: 41.4,
                lng: 2.1,
            ),
            new WineRouteStopView(
                purchaseId: 702,
                purchasedAt: '2026-01-03T10:00:00+00:00',
                pricePaid: 19.0,
                wineId: 32,
                wineName: 'Route Demo 2',
                winery: null,
                wineType: 'white',
                country: 'spain',
                doId: null,
                doName: null,
                doLogo: null,
                regionLogo: null,
                placeId: 82,
                placeName: 'Shop 2',
                placeAddress: 'Main street 2',
                placeCity: 'Girona',
                placeCountry: 'spain',
                lat: 41.98,
                lng: 2.82,
            ),
        ];
    }
}
