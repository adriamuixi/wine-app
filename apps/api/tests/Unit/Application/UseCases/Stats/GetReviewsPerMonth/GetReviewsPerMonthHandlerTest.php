<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Stats\GetReviewsPerMonth;

use App\Application\UseCases\Stats\GetReviewsPerMonth\GetReviewsPerMonthHandler;
use App\Domain\Model\ReviewMonthStats;
use App\Domain\Repository\ReviewStatsRepository;
use PHPUnit\Framework\TestCase;

final class GetReviewsPerMonthHandlerTest extends TestCase
{
    public function testItReturnsChronologicalArraysForChartSeries(): void
    {
        $handler = new GetReviewsPerMonthHandler(new InMemoryReviewStatsRepository());

        $result = $handler->handle();

        self::assertSame(['2025-11', '2025-12', '2026-01'], $result->months);
        self::assertSame([3, 0, 5], $result->reviewCounts);
        self::assertSame([91.0, null, 88.5], $result->medianScores);
    }
}

final class InMemoryReviewStatsRepository implements ReviewStatsRepository
{
    public function listReviewsPerMonth(): array
    {
        return [
            new ReviewMonthStats(new \DateTimeImmutable('2025-11-01T00:00:00+00:00'), 3, 91.0),
            new ReviewMonthStats(new \DateTimeImmutable('2025-12-01T00:00:00+00:00'), 0, null),
            new ReviewMonthStats(new \DateTimeImmutable('2026-01-01T00:00:00+00:00'), 5, 88.5),
        ];
    }
}
