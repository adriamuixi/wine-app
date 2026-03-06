<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetReviewsPerMonth;

use App\Domain\Model\ReviewMonthStats;
use App\Domain\Repository\ReviewStatsRepository;

final readonly class GetReviewsPerMonthHandler
{
    public function __construct(private ReviewStatsRepository $reviewStats)
    {
    }

    public function handle(): GetReviewsPerMonthResult
    {
        $items = $this->reviewStats->listReviewsPerMonth();

        return new GetReviewsPerMonthResult(
            months: array_map(
                static fn (ReviewMonthStats $item): string => $item->month->format('Y-m'),
                $items,
            ),
            reviewCounts: array_map(
                static fn (ReviewMonthStats $item): int => $item->reviewCount,
                $items,
            ),
            medianScores: array_map(
                static fn (ReviewMonthStats $item): ?float => $item->medianScore,
                $items,
            ),
        );
    }
}
