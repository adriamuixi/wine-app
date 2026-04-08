<?php

declare(strict_types=1);

namespace App\Adapters\In\Http;

use App\Application\UseCases\Stats\GetGenericStats\GetGenericStatsHandler;
use App\Application\UseCases\Stats\GetGenericStats\GetGenericStatsUnauthenticated;
use App\Application\UseCases\Stats\GetActivityStats\GetActivityStatsHandler;
use App\Application\UseCases\Stats\GetCatalogHealthStats\GetCatalogHealthStatsHandler;
use App\Application\UseCases\Stats\GetCoverageStats\GetCoverageStatsHandler;
use App\Application\UseCases\Stats\GetCoverageStats\GetCoverageStatsUnauthenticated;
use App\Application\UseCases\Stats\GetPairAgreementStats\GetPairAgreementStatsHandler;
use App\Application\UseCases\Stats\GetReviewsPerMonth\GetReviewsPerMonthHandler;
use App\Application\UseCases\Stats\GetScoreDistributionStats\GetScoreDistributionStatsHandler;
use App\Application\UseCases\Stats\GetScoringGenericStats\GetScoringGenericStatsHandler;
use App\Application\UseCases\Stats\GetValueStats\GetValueStatsHandler;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class StatsController
{
    public function __construct(
        private readonly GetReviewsPerMonthHandler $getReviewsPerMonthHandler,
        private readonly GetGenericStatsHandler $getGenericStatsHandler,
        private readonly GetScoringGenericStatsHandler $getScoringGenericStatsHandler,
        private readonly GetCoverageStatsHandler $getCoverageStatsHandler,
        private readonly GetActivityStatsHandler $getActivityStatsHandler,
        private readonly GetScoreDistributionStatsHandler $getScoreDistributionStatsHandler,
        private readonly GetValueStatsHandler $getValueStatsHandler,
        private readonly GetCatalogHealthStatsHandler $getCatalogHealthStatsHandler,
        private readonly GetPairAgreementStatsHandler $getPairAgreementStatsHandler,
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

    #[Route('/api/stats/coverage', name: 'api_stats_coverage', methods: ['GET'])]
    public function coverage(): JsonResponse
    {
        try {
            $result = $this->getCoverageStatsHandler->handle();
        } catch (GetCoverageStatsUnauthenticated $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_UNAUTHORIZED);
        }

        return new JsonResponse([
            'total_wines' => $result->totalWines,
            'reviewed_wines' => $result->reviewedWines,
            'total_reviews' => $result->totalReviews,
            'review_coverage_pct' => $result->reviewCoveragePct,
            'avg_score' => $result->avgScore,
            'median_score' => $result->medianScore,
            'my_reviews' => $result->myReviews,
            'users_with_reviews' => $result->usersWithReviews,
        ], Response::HTTP_OK);
    }

    #[Route('/api/stats/activity', name: 'api_stats_activity', methods: ['GET'])]
    public function activity(): JsonResponse
    {
        $result = $this->getActivityStatsHandler->handle();

        return new JsonResponse([
            'months' => $result->months,
            'review_counts' => $result->reviewCounts,
            'avg_scores' => $result->avgScores,
            'median_scores' => $result->medianScores,
            'summary' => [
                'last_month_reviews' => $result->lastMonthReviews,
                'avg_reviews_per_month' => $result->avgReviewsPerMonth,
                'best_month' => $result->bestMonth === null ? null : [
                    'month' => $result->bestMonth->month,
                    'reviews' => $result->bestMonth->reviews,
                ],
                'last_active_month' => $result->lastActiveMonth,
            ],
        ], Response::HTTP_OK);
    }

    #[Route('/api/stats/score-distribution', name: 'api_stats_score_distribution', methods: ['GET'])]
    public function scoreDistribution(): JsonResponse
    {
        $result = $this->getScoreDistributionStatsHandler->handle();

        return new JsonResponse([
            'buckets' => array_map(
                static fn (object $item): array => [
                    'label' => $item->label,
                    'count' => $item->count,
                ],
                $result->buckets,
            ),
            'approved_70_pct' => $result->approved70Pct,
            'great_80_pct' => $result->great80Pct,
            'min_score' => $result->minScore,
            'max_score' => $result->maxScore,
            'std_dev' => $result->stdDev,
        ], Response::HTTP_OK);
    }

    #[Route('/api/stats/value', name: 'api_stats_value', methods: ['GET'])]
    public function value(): JsonResponse
    {
        $result = $this->getValueStatsHandler->handle();

        return new JsonResponse([
            'price_score_correlation' => $result->priceScoreCorrelation,
            'regression_slope' => $result->regressionSlope,
            'regression_intercept' => $result->regressionIntercept,
            'median_price' => $result->medianPrice,
            'min_price' => $result->minPrice,
            'max_price' => $result->maxPrice,
            'price_bands' => array_map(
                static fn (object $item): array => [
                    'label' => $item->label,
                    'wines' => $item->wines,
                    'avg_score' => $item->avgScore,
                ],
                $result->priceBands,
            ),
            'top_value_wines' => array_map(
                static fn (object $item): array => [
                    'wine_id' => $item->wineId,
                    'name' => $item->name,
                    'do_name' => $item->doName,
                    'price' => $item->price,
                    'avg_score' => $item->avgScore,
                    'value_index' => $item->valueIndex,
                ],
                $result->topValueWines,
            ),
            'under_10_high_score' => [
                'count' => $result->under10HighScoreCount,
                'pct' => $result->under10HighScorePct,
                'threshold' => $result->under10HighScoreThreshold,
            ],
        ], Response::HTTP_OK);
    }

    #[Route('/api/stats/catalog-health', name: 'api_stats_catalog_health', methods: ['GET'])]
    public function catalogHealth(): JsonResponse
    {
        $result = $this->getCatalogHealthStatsHandler->handle();

        return new JsonResponse([
            'wines_without_reviews' => $result->winesWithoutReviews,
            'wines_without_photos' => $result->winesWithoutPhotos,
            'wines_with_awards' => $result->winesWithAwards,
            'wines_without_awards' => $result->winesWithoutAwards,
            'photo_coverage_pct' => $result->photoCoveragePct,
            'grape_coverage_pct' => $result->grapeCoveragePct,
            'review_coverage_pct' => $result->reviewCoveragePct,
            'do_logo_coverage_pct' => $result->doLogoCoveragePct,
            'region_logo_coverage_pct' => $result->regionLogoCoveragePct,
            'do_map_coverage_pct' => $result->doMapCoveragePct,
            'places_with_map_pct' => $result->placesWithMapPct,
        ], Response::HTTP_OK);
    }

    #[Route('/api/stats/pair-agreement', name: 'api_stats_pair_agreement', methods: ['GET'])]
    public function pairAgreement(): JsonResponse
    {
        $result = $this->getPairAgreementStatsHandler->handle();

        return new JsonResponse([
            'pairs_count' => $result->pairsCount,
            'avg_diff' => $result->avgDiff,
            'diff_ge_10_pct' => $result->diffGe10Pct,
            'diff_ge_15_pct' => $result->diffGe15Pct,
            'sync_index' => $result->syncIndex,
            'scatter_points' => array_map(
                static fn (object $item): array => [
                    'wine_id' => $item->wineId,
                    'wine_name' => $item->wineName,
                    'do_name' => $item->doName,
                    'user_a_score' => $item->userAScore,
                    'user_b_score' => $item->userBScore,
                    'diff' => $item->diff,
                ],
                $result->scatterPoints,
            ),
            'by_do' => array_map(
                static fn (object $item): array => [
                    'do_name' => $item->doName,
                    'compared_wines' => $item->comparedWines,
                    'avg_diff' => $item->avgDiff,
                ],
                $result->byDo,
            ),
        ], Response::HTTP_OK);
    }
}
