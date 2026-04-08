<?php

declare(strict_types=1);

namespace App\Domain\Model\Stats;

final readonly class ValuePriceBandStat
{
    public function __construct(
        public string $label,
        public int $wines,
        public ?float $avgScore,
    ) {
    }
}
