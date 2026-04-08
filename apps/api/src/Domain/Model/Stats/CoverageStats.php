<?php

declare(strict_types=1);

namespace App\Domain\Model\Stats;

final readonly class CoverageStats
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
