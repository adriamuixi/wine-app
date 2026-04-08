<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetCoverageStats;

use App\Application\Ports\AuthSessionManager;
use App\Domain\Repository\StatsRepository;

final readonly class GetCoverageStatsHandler
{
    public function __construct(
        private AuthSessionManager $session,
        private StatsRepository $stats,
    ) {
    }

    public function handle(): GetCoverageStatsResult
    {
        $userId = $this->session->getAuthenticatedUserId();

        if ($userId === null) {
            throw new GetCoverageStatsUnauthenticated('Unauthenticated.');
        }

        $stats = $this->stats->getCoverageStats($userId);

        return new GetCoverageStatsResult(
            totalWines: $stats->totalWines,
            reviewedWines: $stats->reviewedWines,
            totalReviews: $stats->totalReviews,
            reviewCoveragePct: $stats->reviewCoveragePct,
            avgScore: $stats->avgScore,
            medianScore: $stats->medianScore,
            myReviews: $stats->myReviews,
            usersWithReviews: $stats->usersWithReviews,
        );
    }
}
