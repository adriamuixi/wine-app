<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetReviewsPerMonth;

final readonly class GetReviewsPerMonthResult
{
    /**
     * @param list<string> $months
     * @param list<int> $reviewCounts
     * @param list<float|null> $medianScores
     */
    public function __construct(
        public array $months,
        public array $reviewCounts,
        public array $medianScores,
    ) {
    }
}
