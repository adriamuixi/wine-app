<?php

declare(strict_types=1);

namespace App\Domain\Model\Stats;

final readonly class ActivityBestMonthStat
{
    public function __construct(
        public string $month,
        public int $reviews,
    ) {
    }
}
