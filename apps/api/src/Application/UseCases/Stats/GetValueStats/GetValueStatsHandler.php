<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetValueStats;

use App\Domain\Repository\StatsRepository;

final readonly class GetValueStatsHandler
{
    public function __construct(private StatsRepository $stats)
    {
    }

    public function handle(): GetValueStatsResult
    {
        $stats = $this->stats->getValueStats();

        return new GetValueStatsResult(
            priceScoreCorrelation: $stats->priceScoreCorrelation,
            regressionSlope: $stats->regressionSlope,
            regressionIntercept: $stats->regressionIntercept,
            medianPrice: $stats->medianPrice,
            minPrice: $stats->minPrice,
            maxPrice: $stats->maxPrice,
            priceBands: array_map(
                static fn ($item): GetValueStatsPriceBandResult => new GetValueStatsPriceBandResult(
                    label: $item->label,
                    wines: $item->wines,
                    avgScore: $item->avgScore,
                ),
                $stats->priceBands,
            ),
            topValueWines: array_map(
                static fn ($item): GetValueStatsTopWineResult => new GetValueStatsTopWineResult(
                    wineId: $item->wineId,
                    name: $item->name,
                    doName: $item->doName,
                    price: $item->price,
                    avgScore: $item->avgScore,
                    valueIndex: $item->valueIndex,
                ),
                $stats->topValueWines,
            ),
            under10HighScoreCount: $stats->under10HighScoreCount,
            under10HighScorePct: $stats->under10HighScorePct,
            under10HighScoreThreshold: $stats->under10HighScoreThreshold,
        );
    }
}
