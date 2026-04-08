<?php

declare(strict_types=1);

namespace App\Domain\Model\Stats;

final readonly class ActivityMonthStat
{
    public function __construct(
        public string $month,
        public int $reviewCount,
        public ?float $avgScore,
        public ?float $medianScore,
    ) {
    }
}
