<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetPairAgreementStats;

use App\Domain\Repository\StatsRepository;

final readonly class GetPairAgreementStatsHandler
{
    public function __construct(private StatsRepository $stats)
    {
    }

    public function handle(): GetPairAgreementStatsResult
    {
        $stats = $this->stats->getPairAgreementStats();

        return new GetPairAgreementStatsResult(
            pairsCount: $stats->pairsCount,
            avgDiff: $stats->avgDiff,
            diffGe10Pct: $stats->diffGe10Pct,
            diffGe15Pct: $stats->diffGe15Pct,
            syncIndex: $stats->syncIndex,
            scatterPoints: array_map(
                static fn ($item): GetPairAgreementStatsScatterPointResult => new GetPairAgreementStatsScatterPointResult(
                    wineId: $item->wineId,
                    wineName: $item->wineName,
                    doName: $item->doName,
                    userAScore: $item->userAScore,
                    userBScore: $item->userBScore,
                    diff: $item->diff,
                ),
                $stats->scatterPoints,
            ),
            byDo: array_map(
                static fn ($item): GetPairAgreementStatsByDoResult => new GetPairAgreementStatsByDoResult(
                    doName: $item->doName,
                    comparedWines: $item->comparedWines,
                    avgDiff: $item->avgDiff,
                ),
                $stats->byDo,
            ),
        );
    }
}
