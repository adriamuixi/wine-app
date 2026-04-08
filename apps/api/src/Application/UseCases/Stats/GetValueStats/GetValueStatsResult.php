<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetValueStats;

final readonly class GetValueStatsResult
{
    /**
     * @param list<GetValueStatsPriceBandResult> $priceBands
     * @param list<GetValueStatsTopWineResult> $topValueWines
     */
    public function __construct(
        public float $priceScoreCorrelation,
        public float $regressionSlope,
        public float $regressionIntercept,
        public float $medianPrice,
        public float $minPrice,
        public float $maxPrice,
        public array $priceBands,
        public array $topValueWines,
        public int $under10HighScoreCount,
        public float $under10HighScorePct,
        public int $under10HighScoreThreshold,
    ) {
    }
}
