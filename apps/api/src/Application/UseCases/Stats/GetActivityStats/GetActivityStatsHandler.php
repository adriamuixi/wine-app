<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetActivityStats;

use App\Domain\Repository\StatsRepository;

final readonly class GetActivityStatsHandler
{
    public function __construct(private StatsRepository $stats)
    {
    }

    public function handle(): GetActivityStatsResult
    {
        $stats = $this->stats->getActivityStats();

        return new GetActivityStatsResult(
            months: array_map(
                static fn ($item) => $item->month,
                $stats->activityMonths,
            ),
            reviewCounts: array_map(
                static fn ($item) => $item->reviewCount,
                $stats->activityMonths,
            ),
            avgScores: array_map(
                static fn ($item) => $item->avgScore,
                $stats->activityMonths,
            ),
            medianScores: array_map(
                static fn ($item) => $item->medianScore,
                $stats->activityMonths,
            ),
            lastMonthReviews: $stats->lastMonthReviews,
            avgReviewsPerMonth: $stats->avgReviewsPerMonth,
            bestMonth: $stats->bestMonth === null
                ? null
                : new GetActivityStatsBestMonthResult(
                    month: $stats->bestMonth->month,
                    reviews: $stats->bestMonth->reviews,
                ),
            lastActiveMonth: $stats->lastActiveMonth,
        );
    }
}
