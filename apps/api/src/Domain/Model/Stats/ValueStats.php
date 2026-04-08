<?php

declare(strict_types=1);

namespace App\Domain\Model\Stats;

final readonly class ValueStats
{
    /**
     * @param list<ValuePriceBandStat> $priceBands
     * @param list<ValueTopWineStat> $topValueWines
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
