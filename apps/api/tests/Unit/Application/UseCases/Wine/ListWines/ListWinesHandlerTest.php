<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Wine\ListWines;

use App\Domain\Repository\WineRepository;
use App\Application\UseCases\Wine\CreateWine\CreateWineCommand;
use App\Domain\Model\Wine;
use App\Application\UseCases\Wine\ListWines\ListWinesHandler;
use App\Application\UseCases\Wine\ListWines\ListWinesQuery;
use App\Application\UseCases\Wine\ListWines\ListWinesResult;
use App\Application\UseCases\Wine\ListWines\ListWinesSort;
use App\Application\UseCases\Wine\ListWines\ListWinesValidationException;
use App\Application\UseCases\Wine\ListWines\WineListItemAwardView;
use App\Application\UseCases\Wine\ListWines\WineListItemGrapeView;
use App\Application\UseCases\Wine\ListWines\WineListItemPhotoView;
use App\Application\UseCases\Wine\ListWines\WineListItemReviewView;
use App\Application\UseCases\Wine\ListWines\WineListItemView;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineCommand;
use App\Domain\Enum\Country;
use PHPUnit\Framework\TestCase;

final class ListWinesHandlerTest extends TestCase
{
    public function testItReturnsPaginatedResult(): void
    {
        $repo = new SpyWineRepository();
        $handler = new ListWinesHandler($repo);

        $result = $handler->handle(new ListWinesQuery(
            page: 1,
            limit: 20,
            search: null,
            wineType: null,
            country: null,
            doId: null,
            grapeId: null,
            scoreMin: null,
            scoreMax: null,
            sortBy: ListWinesSort::CREATED_AT,
            sortDir: ListWinesSort::DESC,
        ));

        self::assertSame(1, $result->page);
        self::assertSame(1, count($result->items));
        self::assertSame(1, $repo->received?->page);
        self::assertSame('Tempranillo', $result->items[0]->grapes[0]->name);
        self::assertSame('parker', $result->items[0]->awards[0]->name);
        self::assertSame('bottle', $result->items[0]->photos[0]->type);
        self::assertSame(7, $result->items[0]->reviews[0]->userId);
        self::assertSame(91, $result->items[0]->reviews[0]->score);
    }

    public function testItValidatesLimit(): void
    {
        $handler = new ListWinesHandler(new SpyWineRepository());

        $this->expectException(ListWinesValidationException::class);
        $handler->handle(new ListWinesQuery(
            page: 1,
            limit: 101,
            search: null,
            wineType: null,
            country: null,
            doId: null,
            grapeId: null,
            scoreMin: null,
            scoreMax: null,
            sortBy: ListWinesSort::CREATED_AT,
            sortDir: ListWinesSort::DESC,
        ));
    }

    public function testItValidatesSortBy(): void
    {
        $handler = new ListWinesHandler(new SpyWineRepository());

        $this->expectException(ListWinesValidationException::class);
        $handler->handle(new ListWinesQuery(
            page: 1,
            limit: 20,
            search: null,
            wineType: null,
            country: null,
            doId: null,
            grapeId: null,
            scoreMin: null,
            scoreMax: null,
            sortBy: 'unknown',
            sortDir: ListWinesSort::DESC,
        ));
    }
}

final class SpyWineRepository implements WineRepository
{
    public ?ListWinesQuery $received = null;

    public function create(CreateWineCommand $command, ?Country $country): int
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

    public function findById(int $id): ?Wine
    {
        return null;
    }

    public function findPaginated(ListWinesQuery $query): ListWinesResult
    {
        $this->received = $query;

        return new ListWinesResult(
            items: [new WineListItemView(
                1,
                'Wine',
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                '2026-03-01T10:00:00+00:00',
                [new WineListItemGrapeView(2, 'Tempranillo', 'red', 90.0)],
                [new WineListItemAwardView('parker', 95.5, 2025)],
                [
                    new WineListItemPhotoView('bottle', '/images/wines/1/bottle.jpg'),
                    new WineListItemPhotoView('front_label', null),
                    new WineListItemPhotoView('back_label', null),
                    new WineListItemPhotoView('situation', null),
                ],
                [
                    new WineListItemReviewView(7, 91),
                    new WineListItemReviewView(3, 88),
                ],
            )],
            page: $query->page,
            limit: $query->limit,
            totalItems: 1,
            totalPages: 1,
        );
    }
}
