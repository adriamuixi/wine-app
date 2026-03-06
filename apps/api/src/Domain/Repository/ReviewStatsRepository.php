<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Model\GenericStats;
use App\Domain\Model\ReviewMonthStats;
use App\Domain\Model\ScoreBucketStat;

interface ReviewStatsRepository
{
    /**
     * @return list<ReviewMonthStats>
     */
    public function listReviewsPerMonth(): array;

    public function getGenericStats(int $userId): GenericStats;

    /**
     * @return list<ScoreBucketStat>
     */
    public function getScoringGenericStats(): array;
}
