<?php

declare(strict_types=1);

namespace App\Tests\Unit\Adapters\In\Http;

use App\Adapters\In\Http\StatsController;
use App\Application\Ports\AuthSessionManager;
use App\Application\UseCases\Stats\GetActivityStats\GetActivityStatsHandler;
use App\Application\UseCases\Stats\GetCatalogHealthStats\GetCatalogHealthStatsHandler;
use App\Application\UseCases\Stats\GetCoverageStats\GetCoverageStatsHandler;
use App\Application\UseCases\Stats\GetGenericStats\GetGenericStatsHandler;
use App\Application\UseCases\Stats\GetPairAgreementStats\GetPairAgreementStatsHandler;
use App\Application\UseCases\Stats\GetReviewsPerMonth\GetReviewsPerMonthHandler;
use App\Application\UseCases\Stats\GetScoreDistributionStats\GetScoreDistributionStatsHandler;
use App\Application\UseCases\Stats\GetScoringGenericStats\GetScoringGenericStatsHandler;
use App\Application\UseCases\Stats\GetValueStats\GetValueStatsHandler;
use App\Domain\Model\GenericStats;
use App\Domain\Model\ReviewMonthStats;
use App\Domain\Model\ScoreBucketStat;
use App\Domain\Model\Stats\ActivityBestMonthStat;
use App\Domain\Model\Stats\ActivityMonthStat;
use App\Domain\Model\Stats\ActivityStats;
use App\Domain\Model\Stats\CatalogHealthStats;
use App\Domain\Model\Stats\CoverageStats;
use App\Domain\Model\Stats\PairAgreementByDoStat;
use App\Domain\Model\Stats\PairAgreementScatterPointStat;
use App\Domain\Model\Stats\PairAgreementStats;
use App\Domain\Model\Stats\ScoreDistributionBucketStat;
use App\Domain\Model\Stats\ScoreDistributionStats;
use App\Domain\Model\Stats\ValuePriceBandStat;
use App\Domain\Model\Stats\ValueStats;
use App\Domain\Model\Stats\ValueTopWineStat;
use App\Domain\Repository\ReviewStatsRepository;
use App\Domain\Repository\StatsRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Response;

final class StatsControllerTest extends TestCase
{
    public function testGenericReturnsKpiPayload(): void
    {
        $response = $this->makeController()->generic();
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame(12, $payload['total_wines']);
        self::assertSame(44, $payload['total_reviews']);
        self::assertSame(5, $payload['my_reviews']);
        self::assertSame(86.3, $payload['average_red']);
        self::assertSame(84.8, $payload['average_white']);
    }

    public function testReviewsPerMonthReturnsChartPayload(): void
    {
        $response = $this->makeController()->reviewsPerMonth();
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame(['2025-11', '2025-12', '2026-01'], $payload['months']);
        self::assertSame([3, 0, 5], $payload['review_counts']);
        self::assertSame([91, null, 88.5], $payload['median_scores']);
    }

    public function testSocringGenericReturnsBucketPayload(): void
    {
        $response = $this->makeController()->socringGeneric();
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame([
            ['label' => '90+', 'count' => 3],
            ['label' => '80-89', 'count' => 4],
            ['label' => '70-79', 'count' => 2],
            ['label' => '60-69', 'count' => 0],
            ['label' => '<60', 'count' => 0],
        ], $payload['items']);
    }

    public function testCoverageReturnsCoveragePayload(): void
    {
        $response = $this->makeController()->coverage();
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame(76, $payload['total_wines']);
        self::assertSame(29, $payload['reviewed_wines']);
        self::assertSame(54, $payload['total_reviews']);
        self::assertSame(38.2, $payload['review_coverage_pct']);
        self::assertSame(71.5, $payload['avg_score']);
        self::assertSame(71.0, $payload['median_score']);
        self::assertSame(27, $payload['my_reviews']);
        self::assertSame(2, $payload['users_with_reviews']);
    }

    public function testActivityReturnsActivityPayload(): void
    {
        $response = $this->makeController()->activity();
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame(['2025-11', '2025-12', '2026-01'], $payload['months']);
        self::assertSame([3, 0, 5], $payload['review_counts']);
        self::assertSame([90.5, null, 87.3], $payload['avg_scores']);
        self::assertSame([91.0, null, 88.5], $payload['median_scores']);
        self::assertSame(5, $payload['summary']['last_month_reviews']);
        self::assertSame(2.7, $payload['summary']['avg_reviews_per_month']);
        self::assertSame(['month' => '2026-01', 'reviews' => 5], $payload['summary']['best_month']);
        self::assertSame('2026-01', $payload['summary']['last_active_month']);
    }

    public function testScoreDistributionReturnsDistributionPayload(): void
    {
        $response = $this->makeController()->scoreDistribution();
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame([
            ['label' => '90+', 'count' => 2],
            ['label' => '80-89', 'count' => 6],
            ['label' => '70-79', 'count' => 9],
            ['label' => '60-69', 'count' => 5],
            ['label' => '<60', 'count' => 1],
        ], $payload['buckets']);
        self::assertSame(73.9, $payload['approved_70_pct']);
        self::assertSame(34.8, $payload['great_80_pct']);
        self::assertSame(43, $payload['min_score']);
        self::assertSame(94, $payload['max_score']);
        self::assertSame(11.8, $payload['std_dev']);
    }

    public function testValueReturnsValuePayload(): void
    {
        $response = $this->makeController()->value();
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame(0.305, $payload['price_score_correlation']);
        self::assertSame(0.42, $payload['regression_slope']);
        self::assertSame(66.8, $payload['regression_intercept']);
        self::assertSame(10.48, $payload['median_price']);
        self::assertSame(3.89, $payload['min_price']);
        self::assertSame(48.0, $payload['max_price']);
        self::assertCount(3, $payload['price_bands']);
        self::assertCount(2, $payload['top_value_wines']);
        self::assertSame([
            'count' => 6,
            'pct' => 30.0,
            'threshold' => 80,
        ], $payload['under_10_high_score']);
    }

    public function testCatalogHealthReturnsCatalogHealthPayload(): void
    {
        $response = $this->makeController()->catalogHealth();
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame(47, $payload['wines_without_reviews']);
        self::assertSame(4, $payload['wines_without_photos']);
        self::assertSame(2, $payload['wines_with_awards']);
        self::assertSame(74, $payload['wines_without_awards']);
        self::assertSame(94.7, $payload['photo_coverage_pct']);
        self::assertSame(100.0, $payload['grape_coverage_pct']);
        self::assertSame(38.2, $payload['review_coverage_pct']);
        self::assertSame(56.4, $payload['do_logo_coverage_pct']);
        self::assertSame(52.0, $payload['region_logo_coverage_pct']);
        self::assertSame(100.0, $payload['do_map_coverage_pct']);
        self::assertSame(82.5, $payload['places_with_map_pct']);
    }

    public function testPairAgreementReturnsPairAgreementPayload(): void
    {
        $response = $this->makeController()->pairAgreement();
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame(25, $payload['pairs_count']);
        self::assertSame(6.6, $payload['avg_diff']);
        self::assertSame(36.0, $payload['diff_ge_10_pct']);
        self::assertSame(8.0, $payload['diff_ge_15_pct']);
        self::assertSame(32.0, $payload['sync_index']);
        self::assertCount(2, $payload['scatter_points']);
        self::assertCount(2, $payload['by_do']);
    }

    private function makeController(): StatsController
    {
        $stats = new InMemoryStatsRepository();
        $session = new SpyStatsAuthSessionManager();

        return new StatsController(
            new GetReviewsPerMonthHandler($stats),
            new GetGenericStatsHandler($session, $stats),
            new GetScoringGenericStatsHandler($stats),
            new GetCoverageStatsHandler($session, $stats),
            new GetActivityStatsHandler($stats),
            new GetScoreDistributionStatsHandler($stats),
            new GetValueStatsHandler($stats),
            new GetCatalogHealthStatsHandler($stats),
            new GetPairAgreementStatsHandler($stats),
        );
    }
}

final class InMemoryStatsRepository implements ReviewStatsRepository, StatsRepository
{
    public function listReviewsPerMonth(): array
    {
        return [
            new ReviewMonthStats(new \DateTimeImmutable('2025-11-01T00:00:00+00:00'), 3, 91.0),
            new ReviewMonthStats(new \DateTimeImmutable('2025-12-01T00:00:00+00:00'), 0, null),
            new ReviewMonthStats(new \DateTimeImmutable('2026-01-01T00:00:00+00:00'), 5, 88.5),
        ];
    }

    public function getGenericStats(int $userId): GenericStats
    {
        return new GenericStats(12, 44, 5, 86.3, 84.8);
    }

    public function getScoringGenericStats(): array
    {
        return [
            new ScoreBucketStat('90+', 3),
            new ScoreBucketStat('80-89', 4),
            new ScoreBucketStat('70-79', 2),
            new ScoreBucketStat('60-69', 0),
            new ScoreBucketStat('<60', 0),
        ];
    }

    public function getCoverageStats(int $userId): CoverageStats
    {
        return new CoverageStats(76, 29, 54, 38.2, 71.5, 71.0, 27, 2);
    }

    public function getActivityStats(): ActivityStats
    {
        return new ActivityStats(
            activityMonths: [
                new ActivityMonthStat('2025-11', 3, 90.5, 91.0),
                new ActivityMonthStat('2025-12', 0, null, null),
                new ActivityMonthStat('2026-01', 5, 87.3, 88.5),
            ],
            lastMonthReviews: 5,
            avgReviewsPerMonth: 2.7,
            bestMonth: new ActivityBestMonthStat('2026-01', 5),
            lastActiveMonth: '2026-01',
        );
    }

    public function getScoreDistributionStats(): ScoreDistributionStats
    {
        return new ScoreDistributionStats(
            buckets: [
                new ScoreDistributionBucketStat('90+', 2),
                new ScoreDistributionBucketStat('80-89', 6),
                new ScoreDistributionBucketStat('70-79', 9),
                new ScoreDistributionBucketStat('60-69', 5),
                new ScoreDistributionBucketStat('<60', 1),
            ],
            approved70Pct: 73.9,
            great80Pct: 34.8,
            minScore: 43,
            maxScore: 94,
            stdDev: 11.8,
        );
    }

    public function getValueStats(): ValueStats
    {
        return new ValueStats(
            priceScoreCorrelation: 0.305,
            regressionSlope: 0.42,
            regressionIntercept: 66.8,
            medianPrice: 10.48,
            minPrice: 3.89,
            maxPrice: 48.0,
            priceBands: [
                new ValuePriceBandStat('<10', 20, 69.2),
                new ValuePriceBandStat('10-15', 4, 81.6),
                new ValuePriceBandStat('15-25', 5, 72.6),
            ],
            topValueWines: [
                new ValueTopWineStat(1, 'Clot d’encis', 'Terra Alta', 4.10, 73.5, 17.93),
                new ValueTopWineStat(2, 'Titella', 'Montsant', 5.20, 80.5, 15.48),
            ],
            under10HighScoreCount: 6,
            under10HighScorePct: 30.0,
            under10HighScoreThreshold: 80,
        );
    }

    public function getCatalogHealthStats(): CatalogHealthStats
    {
        return new CatalogHealthStats(
            winesWithoutReviews: 47,
            winesWithoutPhotos: 4,
            winesWithAwards: 2,
            winesWithoutAwards: 74,
            photoCoveragePct: 94.7,
            grapeCoveragePct: 100.0,
            reviewCoveragePct: 38.2,
            doLogoCoveragePct: 56.4,
            regionLogoCoveragePct: 52.0,
            doMapCoveragePct: 100.0,
            placesWithMapPct: 82.5,
        );
    }

    public function getPairAgreementStats(): PairAgreementStats
    {
        return new PairAgreementStats(
            pairsCount: 25,
            avgDiff: 6.6,
            diffGe10Pct: 36.0,
            diffGe15Pct: 8.0,
            syncIndex: 32.0,
            scatterPoints: [
                new PairAgreementScatterPointStat(1, 'Titella', 'Montsant', 74, 82, 8),
                new PairAgreementScatterPointStat(2, 'Enate', 'Somontano', 70, 76, 6),
            ],
            byDo: [
                new PairAgreementByDoStat('Montsant', 6, 8.5),
                new PairAgreementByDoStat('Toro', 3, 10.3),
            ],
        );
    }
}

final class SpyStatsAuthSessionManager implements AuthSessionManager
{
    public function loginByUserId(int $userId): void
    {
    }

    public function getAuthenticatedUserId(): ?int
    {
        return 1;
    }

    public function logout(): void
    {
    }
}
