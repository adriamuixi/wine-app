<?php

declare(strict_types=1);

namespace App\Domain\Model;

final readonly class GenericStats
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
