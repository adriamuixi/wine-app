<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetScoreDistributionStats;

use App\Domain\Repository\StatsRepository;

final readonly class GetScoreDistributionStatsHandler
{
    public function __construct(private StatsRepository $stats)
    {
    }

    public function handle(): GetScoreDistributionStatsResult
    {
        $stats = $this->stats->getScoreDistributionStats();

        return new GetScoreDistributionStatsResult(
            buckets: array_map(
                static fn ($item): GetScoreDistributionStatsBucketResult => new GetScoreDistributionStatsBucketResult(
                    label: $item->label,
                    count: $item->count,
                ),
                $stats->buckets,
            ),
            approved70Pct: $stats->approved70Pct,
            great80Pct: $stats->great80Pct,
            minScore: $stats->minScore,
            maxScore: $stats->maxScore,
            stdDev: $stats->stdDev,
        );
    }
}
