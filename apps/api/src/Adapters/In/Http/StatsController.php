<?php

declare(strict_types=1);

namespace App\Adapters\In\Http;

use App\Application\UseCases\Stats\GetGenericStats\GetGenericStatsHandler;
use App\Application\UseCases\Stats\GetGenericStats\GetGenericStatsUnauthenticated;
use App\Application\UseCases\Stats\GetReviewsPerMonth\GetReviewsPerMonthHandler;
use App\Application\UseCases\Stats\GetScoringGenericStats\GetScoringGenericStatsHandler;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class StatsController
{
    public function __construct(
        private readonly GetReviewsPerMonthHandler $getReviewsPerMonthHandler,
        private readonly GetGenericStatsHandler $getGenericStatsHandler,
        private readonly GetScoringGenericStatsHandler $getScoringGenericStatsHandler,
    ) {
    }

    #[Route('/api/stats/generic', name: 'api_stats_generic', methods: ['GET'])]
    public function generic(): JsonResponse
    {
        try {
            $result = $this->getGenericStatsHandler->handle();
        } catch (GetGenericStatsUnauthenticated $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_UNAUTHORIZED);
        }

        return new JsonResponse([
            'total_wines' => $result->totalWines,
            'total_reviews' => $result->totalReviews,
            'my_reviews' => $result->myReviews,
            'average_red' => $result->averageRed,
            'average_white' => $result->averageWhite,
        ], Response::HTTP_OK);
    }

    #[Route('/api/stats/reviews-per-monh', name: 'api_stats_reviews_per_monh', methods: ['GET'])]
    public function reviewsPerMonth(): JsonResponse
    {
        $result = $this->getReviewsPerMonthHandler->handle();

        return new JsonResponse([
            'months' => $result->months,
            'review_counts' => $result->reviewCounts,
            'median_scores' => $result->medianScores,
        ], Response::HTTP_OK);
    }

    #[Route('/api/stats/socring-generic', name: 'api_stats_socring_generic', methods: ['GET'])]
    public function socringGeneric(): JsonResponse
    {
        $result = $this->getScoringGenericStatsHandler->handle();

        return new JsonResponse([
            'items' => $result->items,
        ], Response::HTTP_OK);
    }
}
