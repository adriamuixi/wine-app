<?php

declare(strict_types=1);

namespace App\Domain\Model\Stats;

final readonly class CatalogHealthStats
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
