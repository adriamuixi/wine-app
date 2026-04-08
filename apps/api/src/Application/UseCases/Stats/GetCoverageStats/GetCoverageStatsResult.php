<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetCoverageStats;

final readonly class GetCoverageStatsResult
{
    public function __construct(
        public int $totalWines,
        public int $reviewedWines,
        public int $totalReviews,
        public float $reviewCoveragePct,
        public float $avgScore,
        public float $medianScore,
        public int $myReviews,
        public int $usersWithReviews,
    ) {
    }
}
