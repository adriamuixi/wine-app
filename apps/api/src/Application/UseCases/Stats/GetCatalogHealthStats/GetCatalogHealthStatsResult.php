<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetCatalogHealthStats;

final readonly class GetCatalogHealthStatsResult
{
    public function __construct(
        public int $winesWithoutReviews,
        public int $winesWithoutPhotos,
        public int $winesWithAwards,
        public int $winesWithoutAwards,
        public float $photoCoveragePct,
        public float $grapeCoveragePct,
        public float $reviewCoveragePct,
        public float $doLogoCoveragePct,
        public float $regionLogoCoveragePct,
        public float $doMapCoveragePct,
        public float $placesWithMapPct,
    ) {
    }
}
