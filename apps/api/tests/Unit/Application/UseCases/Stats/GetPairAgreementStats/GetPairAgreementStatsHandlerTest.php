<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Stats\GetPairAgreementStats;

use App\Application\UseCases\Stats\GetPairAgreementStats\GetPairAgreementStatsHandler;
use App\Domain\Model\Stats\ActivityStats;
use App\Domain\Model\Stats\CatalogHealthStats;
use App\Domain\Model\Stats\CoverageStats;
use App\Domain\Model\Stats\PairAgreementByDoStat;
use App\Domain\Model\Stats\PairAgreementScatterPointStat;
use App\Domain\Model\Stats\PairAgreementStats;
use App\Domain\Model\Stats\ScoreDistributionStats;
use App\Domain\Model\Stats\ValueStats;
use App\Domain\Repository\StatsRepository;
use PHPUnit\Framework\TestCase;

final class GetPairAgreementStatsHandlerTest extends TestCase
{
    public function testItReturnsAgreementSummaryScatterAndByDoBreakdown(): void
    {
        $handler = new GetPairAgreementStatsHandler(new InMemoryPairAgreementStatsRepository());

        $result = $handler->handle();

        self::assertSame(25, $result->pairsCount);
        self::assertSame(6.6, $result->avgDiff);
        self::assertSame(36.0, $result->diffGe10Pct);
        self::assertSame(8.0, $result->diffGe15Pct);
        self::assertSame(32.0, $result->syncIndex);
        self::assertCount(2, $result->scatterPoints);
        self::assertCount(2, $result->byDo);
        self::assertSame('Montsant', $result->byDo[0]->doName);
    }
}

final class InMemoryPairAgreementStatsRepository implements StatsRepository
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
        throw new \LogicException('Not needed in this test.');
    }

    public function getCatalogHealthStats(): CatalogHealthStats
    {
        throw new \LogicException('Not needed in this test.');
    }

    public function getPairAgreementStats(): PairAgreementStats
    {
        return new PairAgreementStats(
            pairsCount: 25,
            avgDiff: 6.6,
            diffGe10Pct: 36.0,
            diffGe15Pct: 8.0,
            syncIndex: 32.0,
            scatterPoints: [
                new PairAgreementScatterPointStat(1, 'Titella', 'Montsant', 74, 82, 8),
                new PairAgreementScatterPointStat(2, 'Enate', 'Somontano', 70, 76, 6),
            ],
            byDo: [
                new PairAgreementByDoStat('Montsant', 6, 8.5),
                new PairAgreementByDoStat('Toro', 3, 10.3),
            ],
        );
    }
}
