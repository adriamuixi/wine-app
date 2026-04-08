<?php

declare(strict_types=1);

namespace App\Domain\Model\Stats;

final readonly class ScoreDistributionBucketStat
{
    public function __construct(
        public string $label,
        public int $count,
    ) {
    }
}
