<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetActivityStats;

final readonly class GetActivityStatsResult
{
    /**
     * @param list<string> $months
     * @param list<int> $reviewCounts
     * @param list<float|null> $avgScores
     * @param list<float|null> $medianScores
     */
    public function __construct(
        public array $months,
        public array $reviewCounts,
        public array $avgScores,
        public array $medianScores,
        public int $lastMonthReviews,
        public float $avgReviewsPerMonth,
        public ?GetActivityStatsBestMonthResult $bestMonth,
        public ?string $lastActiveMonth,
    ) {
    }
}
