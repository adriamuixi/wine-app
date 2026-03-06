<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetGenericStats;

final readonly class GetGenericStatsResult
{
    public function __construct(
        public int $totalWines,
        public int $totalReviews,
        public int $myReviews,
        public float $averageRed,
        public float $averageWhite,
    ) {
    }
}
