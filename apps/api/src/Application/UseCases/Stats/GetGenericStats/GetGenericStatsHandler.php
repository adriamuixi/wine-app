<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetGenericStats;

use App\Application\Ports\AuthSessionManager;
use App\Domain\Repository\ReviewStatsRepository;

final readonly class GetGenericStatsHandler
{
    public function __construct(
        private AuthSessionManager $authSession,
        private ReviewStatsRepository $reviewStats,
    ) {
    }

    public function handle(): GetGenericStatsResult
    {
        $authenticatedUserId = $this->authSession->getAuthenticatedUserId();
        if (null === $authenticatedUserId) {
            throw new GetGenericStatsUnauthenticated('Unauthenticated.');
        }

        $stats = $this->reviewStats->getGenericStats($authenticatedUserId);

        return new GetGenericStatsResult(
            totalWines: $stats->totalWines,
            totalReviews: $stats->totalReviews,
            myReviews: $stats->myReviews,
            averageRed: $stats->averageRed,
            averageWhite: $stats->averageWhite,
        );
    }
}
