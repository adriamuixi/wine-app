<?php

declare(strict_types=1);

namespace App\Domain\Model\Stats;

final readonly class PairAgreementStats
{
    /**
     * @param list<PairAgreementScatterPointStat> $scatterPoints
     * @param list<PairAgreementByDoStat> $byDo
     */
    public function __construct(
        public int $pairsCount,
        public float $avgDiff,
        public float $diffGe10Pct,
        public float $diffGe15Pct,
        public float $syncIndex,
        public array $scatterPoints,
        public array $byDo,
    ) {
    }
}
