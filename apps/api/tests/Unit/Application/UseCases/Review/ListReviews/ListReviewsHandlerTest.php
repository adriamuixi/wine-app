<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Review\ListReviews;

use App\Application\UseCases\Review\ListReviews\ListReviewsHandler;
use App\Application\UseCases\Review\ListReviews\ListReviewsQuery;
use App\Application\UseCases\Review\ListReviews\ListReviewsResult;
use App\Application\UseCases\Review\ListReviews\ListReviewsSort;
use App\Application\UseCases\Review\ListReviews\ListReviewsValidationException;
use App\Application\UseCases\Review\ListReviews\ReviewListItemView;
use App\Domain\Enum\ReviewBullet;
use App\Domain\Model\WineReview;
use App\Domain\Repository\WineReviewRepository;
use PHPUnit\Framework\TestCase;

final class ListReviewsHandlerTest extends TestCase
{
    public function testItReturnsPaginatedReviews(): void
    {
        $repo = new SpyWineReviewRepository();
        $handler = new ListReviewsHandler($repo);

        $result = $handler->handle(new ListReviewsQuery(
            page: 1,
            limit: 20,
            sortBy: ListReviewsSort::SCORE,
            sortDir: ListReviewsSort::DESC,
        ));

        self::assertSame(1, $result->page);
        self::assertSame(1, count($result->items));
        self::assertSame(1, $repo->received?->page);
        self::assertSame('Wine 2', $result->items[0]->wineName);
        self::assertSame('Rioja', $result->items[0]->doName);
        self::assertSame(88, $result->items[0]->score);
    }

    public function testItValidatesLimit(): void
    {
        $handler = new ListReviewsHandler(new SpyWineReviewRepository());

        $this->expectException(ListReviewsValidationException::class);
        $handler->handle(new ListReviewsQuery(
            page: 1,
            limit: 101,
            sortBy: ListReviewsSort::SCORE,
            sortDir: ListReviewsSort::DESC,
        ));
    }

    public function testItValidatesSortBy(): void
    {
        $handler = new ListReviewsHandler(new SpyWineReviewRepository());

        $this->expectException(ListReviewsValidationException::class);
        $handler->handle(new ListReviewsQuery(
            page: 1,
            limit: 20,
            sortBy: 'unknown',
            sortDir: ListReviewsSort::DESC,
        ));
    }
}

final class SpyWineReviewRepository implements WineReviewRepository
{
    public ?ListReviewsQuery $received = null;

    public function findById(int $id): ?WineReview
    {
        return null;
    }

    public function existsByUserAndWine(int $userId, int $wineId): bool
    {
        return false;
    }

    public function create(WineReview $review): int
    {
        return 1;
    }

    public function update(WineReview $review): void
    {
    }

    public function deleteById(int $id): void
    {
    }

    public function findPaginated(ListReviewsQuery $query): ListReviewsResult
    {
        $this->received = $query;

        return new ListReviewsResult(
            items: [
                new ReviewListItemView(
                    id: 1,
                    userId: 1,
                    userName: 'Adria',
                    userLastname: 'Muixi',
                    wineId: 2,
                    wineName: 'Wine 2',
                    doId: 4,
                    doName: 'Rioja',
                    score: 88,
                    aroma: 4,
                    appearance: 2,
                    palateEntry: 3,
                    body: 4,
                    persistence: 4,
                    bullets: [ReviewBullet::Floral->value],
                    createdAt: '2026-03-01T10:00:00+00:00',
                ),
            ],
            page: $query->page,
            limit: $query->limit,
            totalItems: 1,
            totalPages: 1,
        );
    }
}
