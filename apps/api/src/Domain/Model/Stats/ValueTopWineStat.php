<?php

declare(strict_types=1);

namespace App\Domain\Model\Stats;

final readonly class ValueTopWineStat
{
    public function __construct(
        public int $wineId,
        public string $name,
        public ?string $doName,
        public float $price,
        public float $avgScore,
        public float $valueIndex,
    ) {
    }
}
