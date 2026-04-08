<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetScoreDistributionStats;

final readonly class GetScoreDistributionStatsBucketResult
{
    public function __construct(
        public string $label,
        public int $count,
    ) {
    }
}
