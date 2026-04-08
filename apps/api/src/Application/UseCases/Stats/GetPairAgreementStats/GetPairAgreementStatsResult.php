<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetPairAgreementStats;

final readonly class GetPairAgreementStatsResult
{
    /**
     * @param list<GetPairAgreementStatsScatterPointResult> $scatterPoints
     * @param list<GetPairAgreementStatsByDoResult> $byDo
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
