<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Stats\GetValueStats;

use App\Application\UseCases\Stats\GetValueStats\GetValueStatsHandler;
use App\Domain\Model\Stats\ActivityStats;
use App\Domain\Model\Stats\CatalogHealthStats;
use App\Domain\Model\Stats\CoverageStats;
use App\Domain\Model\Stats\PairAgreementStats;
use App\Domain\Model\Stats\ScoreDistributionStats;
use App\Domain\Model\Stats\ValuePriceBandStat;
use App\Domain\Model\Stats\ValueStats;
use App\Domain\Model\Stats\ValueTopWineStat;
use App\Domain\Repository\StatsRepository;
use PHPUnit\Framework\TestCase;

final class GetValueStatsHandlerTest extends TestCase
{
    public function testItReturnsSummaryBandsAndTopValueWines(): void
    {
        $handler = new GetValueStatsHandler(new InMemoryValueStatsRepository());

        $result = $handler->handle();

        self::assertSame(0.305, $result->priceScoreCorrelation);
        self::assertSame(0.42, $result->regressionSlope);
        self::assertSame(66.8, $result->regressionIntercept);
        self::assertSame(10.48, $result->medianPrice);
        self::assertSame(3.89, $result->minPrice);
        self::assertSame(48.0, $result->maxPrice);
        self::assertCount(3, $result->priceBands);
        self::assertCount(2, $result->topValueWines);
        self::assertSame(6, $result->under10HighScoreCount);
        self::assertSame(30.0, $result->under10HighScorePct);
        self::assertSame(80, $result->under10HighScoreThreshold);
    }
}

final class InMemoryValueStatsRepository implements StatsRepository
{
    public function getCoverageStats(int $userId): CoverageStats
    {
        throw new \LogicException('Not needed in this test.');
    }

    public function getActivityStats(): ActivityStats
    {
        throw new \LogicException('Not needed in this test.');
    }

    public function getScoreDistributionStats(): ScoreDistributionStats
    {
        throw new \LogicException('Not needed in this test.');
    }

    public function getValueStats(): ValueStats
    {
        return new ValueStats(
            priceScoreCorrelation: 0.305,
            regressionSlope: 0.42,
            regressionIntercept: 66.8,
            medianPrice: 10.48,
            minPrice: 3.89,
            maxPrice: 48.0,
            priceBands: [
                new ValuePriceBandStat('<10', 20, 69.2),
                new ValuePriceBandStat('10-15', 4, 81.6),
                new ValuePriceBandStat('15-25', 5, 72.6),
            ],
            topValueWines: [
                new ValueTopWineStat(1, 'Clot d’encis', 'Terra Alta', 4.10, 73.5, 17.93),
                new ValueTopWineStat(2, 'Titella', 'Montsant', 5.20, 80.5, 15.48),
            ],
            under10HighScoreCount: 6,
            under10HighScorePct: 30.0,
            under10HighScoreThreshold: 80,
        );
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
