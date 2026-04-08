<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetValueStats;

final readonly class GetValueStatsTopWineResult
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
