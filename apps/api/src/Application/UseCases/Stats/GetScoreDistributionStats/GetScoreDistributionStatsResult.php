<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetScoreDistributionStats;

final readonly class GetScoreDistributionStatsResult
{
    /**
     * @param list<GetScoreDistributionStatsBucketResult> $buckets
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
