<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Wine\GetWine;

use App\Domain\Repository\WineRepository;
use App\Application\UseCases\Wine\CreateWine\CreateWineCommand;
use App\Application\UseCases\Wine\GetWine\GetWineDetailsHandler;
use App\Application\UseCases\Wine\GetWine\GetWineDetailsNotFound;
use App\Application\UseCases\Wine\GetWine\WineDetailsView;
use App\Application\UseCases\Wine\ListWines\ListWinesQuery;
use App\Application\UseCases\Wine\ListWines\ListWinesResult;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineCommand;
use App\Domain\Enum\Country;
use PHPUnit\Framework\TestCase;

final class GetWineDetailsHandlerTest extends TestCase
{
    public function testItReturnsWineDetailsWhenWineExists(): void
    {
        $wine = new WineDetailsView(
            id: 10,
            name: 'Mencia',
            winery: null,
            wineType: 'red',
            do: null,
            country: 'spain',
            agingType: null,
            vintageYear: 2021,
            alcoholPercentage: 13.5,
            createdAt: '2026-03-01T10:00:00+00:00',
            updatedAt: '2026-03-01T10:05:00+00:00',
            grapes: [],
            purchases: [],
            awards: [],
            photos: [],
            reviews: [],
        );

        $handler = new GetWineDetailsHandler(new SpyWineRepository($wine));
        $result = $handler->handle(10);

        self::assertSame(10, $result->id);
        self::assertSame('Mencia', $result->name);
    }

    public function testItThrowsWhenWineDoesNotExist(): void
    {
        $handler = new GetWineDetailsHandler(new SpyWineRepository(null));

        $this->expectException(GetWineDetailsNotFound::class);
        $handler->handle(404);
    }
}

final class SpyWineRepository implements WineRepository
{
    public function __construct(private readonly ?WineDetailsView $details)
    {
    }

    public function createWithRelations(CreateWineCommand $command, ?Country $country): int
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
        return false;
    }

    public function findDetailsById(int $id): ?WineDetailsView
    {
        if (null === $this->details || $id !== $this->details->id) {
            return null;
        }

        return $this->details;
    }

    public function findPaginated(ListWinesQuery $query): ListWinesResult
    {
        return new ListWinesResult([], $query->page, $query->limit, 0, 0);
    }
}
