<?php

declare(strict_types=1);

namespace App\Domain\Model\Stats;

final readonly class ScoreDistributionStats
{
    /**
     * @param list<ScoreDistributionBucketStat> $buckets
     */
    public function __construct(
        public array $buckets,
        public float $approved70Pct,
        public float $great80Pct,
        public int $minScore,
        public int $maxScore,
        public float $stdDev,
    ) {
    }
}
