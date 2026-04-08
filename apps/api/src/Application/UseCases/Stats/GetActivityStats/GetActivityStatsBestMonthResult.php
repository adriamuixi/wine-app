<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetActivityStats;

final readonly class GetActivityStatsBestMonthResult
{
    public function __construct(
        public string $month,
        public int $reviews,
    ) {
    }
}
