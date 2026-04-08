<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetValueStats;

final readonly class GetValueStatsPriceBandResult
{
    public function __construct(
        public string $label,
        public int $wines,
        public ?float $avgScore,
    ) {
    }
}
