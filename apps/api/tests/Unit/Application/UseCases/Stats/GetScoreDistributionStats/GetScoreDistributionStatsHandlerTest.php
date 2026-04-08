<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Stats\GetScoreDistributionStats;

use App\Application\UseCases\Stats\GetScoreDistributionStats\GetScoreDistributionStatsHandler;
use App\Domain\Model\Stats\ActivityStats;
use App\Domain\Model\Stats\CatalogHealthStats;
use App\Domain\Model\Stats\CoverageStats;
use App\Domain\Model\Stats\PairAgreementStats;
use App\Domain\Model\Stats\ScoreDistributionBucketStat;
use App\Domain\Model\Stats\ScoreDistributionStats;
use App\Domain\Model\Stats\ValueStats;
use App\Domain\Repository\StatsRepository;
use PHPUnit\Framework\TestCase;

final class GetScoreDistributionStatsHandlerTest extends TestCase
{
    public function testItReturnsOrderedDistributionBucketsAndSummary(): void
    {
        $handler = new GetScoreDistributionStatsHandler(new InMemoryScoreDistributionStatsRepository());

        $result = $handler->handle();

        self::assertSame([
            ['label' => '90+', 'count' => 2],
            ['label' => '80-89', 'count' => 6],
            ['label' => '70-79', 'count' => 9],
            ['label' => '60-69', 'count' => 5],
            ['label' => '<60', 'count' => 1],
        ], array_map(
            static fn (object $item): array => ['label' => $item->label, 'count' => $item->count],
            $result->buckets,
        ));
        self::assertSame(73.9, $result->approved70Pct);
        self::assertSame(34.8, $result->great80Pct);
        self::assertSame(43, $result->minScore);
        self::assertSame(94, $result->maxScore);
        self::assertSame(11.8, $result->stdDev);
    }
}

final class InMemoryScoreDistributionStatsRepository implements StatsRepository
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
        return new ScoreDistributionStats(
            buckets: [
                new ScoreDistributionBucketStat('90+', 2),
                new ScoreDistributionBucketStat('80-89', 6),
                new ScoreDistributionBucketStat('70-79', 9),
                new ScoreDistributionBucketStat('60-69', 5),
                new ScoreDistributionBucketStat('<60', 1),
            ],
            approved70Pct: 73.9,
            great80Pct: 34.8,
            minScore: 43,
            maxScore: 94,
            stdDev: 11.8,
        );
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
