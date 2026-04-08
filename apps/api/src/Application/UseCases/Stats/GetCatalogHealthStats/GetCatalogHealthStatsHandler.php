<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetCatalogHealthStats;

use App\Domain\Repository\StatsRepository;

final readonly class GetCatalogHealthStatsHandler
{
    public function __construct(private StatsRepository $stats)
    {
    }

    public function handle(): GetCatalogHealthStatsResult
    {
        $stats = $this->stats->getCatalogHealthStats();

        return new GetCatalogHealthStatsResult(
            winesWithoutReviews: $stats->winesWithoutReviews,
            winesWithoutPhotos: $stats->winesWithoutPhotos,
            winesWithAwards: $stats->winesWithAwards,
            winesWithoutAwards: $stats->winesWithoutAwards,
            photoCoveragePct: $stats->photoCoveragePct,
            grapeCoveragePct: $stats->grapeCoveragePct,
            reviewCoveragePct: $stats->reviewCoveragePct,
            doLogoCoveragePct: $stats->doLogoCoveragePct,
            regionLogoCoveragePct: $stats->regionLogoCoveragePct,
            doMapCoveragePct: $stats->doMapCoveragePct,
            placesWithMapPct: $stats->placesWithMapPct,
        );
    }
}
