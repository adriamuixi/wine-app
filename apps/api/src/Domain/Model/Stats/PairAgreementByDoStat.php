<?php

declare(strict_types=1);

namespace App\Domain\Model\Stats;

final readonly class PairAgreementByDoStat
{
    public function __construct(
        public ?string $doName,
        public int $comparedWines,
        public float $avgDiff,
    ) {
    }
}
