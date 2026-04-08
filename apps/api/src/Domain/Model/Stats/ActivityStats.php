<?php

declare(strict_types=1);

namespace App\Domain\Model\Stats;

final readonly class ActivityStats
{
    /**
     * @param list<ActivityMonthStat> $activityMonths
     */
    public function __construct(
        public array $activityMonths,
        public int $lastMonthReviews,
        public float $avgReviewsPerMonth,
        public ?ActivityBestMonthStat $bestMonth,
        public ?string $lastActiveMonth,
    ) {
    }
}
