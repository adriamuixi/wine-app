<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Stats\GetActivityStats;

use App\Application\UseCases\Stats\GetActivityStats\GetActivityStatsHandler;
use App\Domain\Model\Stats\ActivityBestMonthStat;
use App\Domain\Model\Stats\ActivityMonthStat;
use App\Domain\Model\Stats\ActivityStats;
use App\Domain\Model\Stats\CatalogHealthStats;
use App\Domain\Model\Stats\CoverageStats;
use App\Domain\Model\Stats\PairAgreementStats;
use App\Domain\Model\Stats\ScoreDistributionStats;
use App\Domain\Model\Stats\ValueStats;
use App\Domain\Repository\StatsRepository;
use PHPUnit\Framework\TestCase;

final class GetActivityStatsHandlerTest extends TestCase
{
    public function testItReturnsChronologicalActivitySeriesAndSummary(): void
    {
        $handler = new GetActivityStatsHandler(new InMemoryActivityStatsRepository());

        $result = $handler->handle();

        self::assertSame(['2025-11', '2025-12', '2026-01'], $result->months);
        self::assertSame([3, 0, 5], $result->reviewCounts);
        self::assertSame([90.5, null, 87.3], $result->avgScores);
        self::assertSame([91.0, null, 88.5], $result->medianScores);
        self::assertSame(5, $result->lastMonthReviews);
        self::assertSame(2.7, $result->avgReviewsPerMonth);
        self::assertNotNull($result->bestMonth);
        self::assertSame('2026-01', $result->bestMonth?->month);
        self::assertSame(5, $result->bestMonth?->reviews);
        self::assertSame('2026-01', $result->lastActiveMonth);
    }
}

final class InMemoryActivityStatsRepository implements StatsRepository
{
    public function getCoverageStats(int $userId): CoverageStats
    {
        throw new \LogicException('Not needed in this test.');
    }

    public function getActivityStats(): ActivityStats
    {
        return new ActivityStats(
            activityMonths: [
                new ActivityMonthStat('2025-11', 3, 90.5, 91.0),
                new ActivityMonthStat('2025-12', 0, null, null),
                new ActivityMonthStat('2026-01', 5, 87.3, 88.5),
            ],
            lastMonthReviews: 5,
            avgReviewsPerMonth: 2.7,
            bestMonth: new ActivityBestMonthStat('2026-01', 5),
            lastActiveMonth: '2026-01',
        );
    }

    public function getScoreDistributionStats(): ScoreDistributionStats
    {
        throw new \LogicException('Not needed in this test.');
    }

    public function getValueStats(): ValueStats
    {
        throw new \LogicException('Not needed in this test.');
    }

    public function getCatalogHealthStats(): CatalogHealthStats
    {
        throw new \LogicException('Not needed in this test.');
    }

    public function getPairAgreementStats(): PairAgreementStats
    {
        throw new \LogicException('Not needed in this test.');
    }
}
