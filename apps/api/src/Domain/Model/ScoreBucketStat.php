<?php

declare(strict_types=1);

namespace App\Domain\Model;

final readonly class ScoreBucketStat
{
    public function __construct(
        public string $label,
        public int $count,
    ) {
    }
}
