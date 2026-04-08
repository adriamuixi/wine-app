<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Repos;

use App\Domain\Model\Stats\ActivityBestMonthStat;
use App\Domain\Model\Stats\ActivityMonthStat;
use App\Domain\Model\Stats\ActivityStats;
use App\Domain\Model\Stats\CatalogHealthStats;
use App\Domain\Model\Stats\CoverageStats;
use App\Domain\Model\GenericStats;
use App\Domain\Model\Stats\PairAgreementByDoStat;
use App\Domain\Model\Stats\PairAgreementScatterPointStat;
use App\Domain\Model\Stats\PairAgreementStats;
use App\Domain\Model\ReviewMonthStats;
use App\Domain\Model\ScoreBucketStat;
use App\Domain\Model\Stats\ScoreDistributionBucketStat;
use App\Domain\Model\Stats\ScoreDistributionStats;
use App\Domain\Model\Stats\ValuePriceBandStat;
use App\Domain\Model\Stats\ValueStats;
use App\Domain\Model\Stats\ValueTopWineStat;
use App\Domain\Repository\ReviewStatsRepository;
use App\Domain\Repository\StatsRepository;
use Doctrine\ORM\EntityManagerInterface;

final readonly class DoctrineReviewStatsRepository implements ReviewStatsRepository, StatsRepository
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
    }

    public function listReviewsPerMonth(): array
    {
        $rows = $this->entityManager->getConnection()->fetchAllAssociative(<<<'SQL'
WITH bounds AS (
    SELECT
        date_trunc('month', MIN(created_at))::date AS start_month,
        date_trunc('month', MAX(created_at))::date AS end_month
    FROM review
),
months AS (
    SELECT generate_series(start_month, end_month, interval '1 month')::date AS month_start
    FROM bounds
    WHERE start_month IS NOT NULL
      AND end_month IS NOT NULL
),
aggregated AS (
    SELECT
        date_trunc('month', created_at)::date AS month_start,
        COUNT(*)::int AS review_count,
        ROUND((percentile_cont(0.5) WITHIN GROUP (ORDER BY score) FILTER (WHERE score IS NOT NULL))::numeric, 2) AS median_score
    FROM review
    GROUP BY 1
)
SELECT
    m.month_start,
    COALESCE(a.review_count, 0) AS review_count,
    a.median_score
FROM months m
LEFT JOIN aggregated a ON a.month_start = m.month_start
ORDER BY m.month_start ASC
SQL);

        /** @var list<array{month_start:string,review_count:int|string,median_score:float|int|string|null}> $rows */
        return array_map(
            static fn (array $row): ReviewMonthStats => new ReviewMonthStats(
                month: new \DateTimeImmutable((string) $row['month_start']),
                reviewCount: (int) $row['review_count'],
                medianScore: null === $row['median_score'] ? null : (float) $row['median_score'],
            ),
            $rows,
        );
    }

    public function getGenericStats(int $userId): GenericStats
    {
        $row = $this->entityManager->getConnection()->fetchAssociative(
            <<<'SQL'
SELECT
    (SELECT COUNT(*)::int FROM wine) AS total_wines,
    (SELECT COUNT(*)::int FROM review) AS total_reviews,
    (SELECT COUNT(*)::int FROM review WHERE user_id = :user_id) AS my_reviews,
    COALESCE((
        SELECT ROUND(AVG(r.score)::numeric, 1)::float
        FROM review r
        JOIN wine w ON w.id = r.wine_id
        WHERE r.score IS NOT NULL
          AND w.wine_type = 'red'
    ), 0)::float AS average_red,
    COALESCE((
        SELECT ROUND(AVG(r.score)::numeric, 1)::float
        FROM review r
        JOIN wine w ON w.id = r.wine_id
        WHERE r.score IS NOT NULL
          AND w.wine_type = 'white'
    ), 0)::float AS average_white
SQL,
            ['user_id' => $userId],
        );

        if (!is_array($row)) {
            return new GenericStats(0, 0, 0, 0.0, 0.0);
        }

        return new GenericStats(
            totalWines: (int) $row['total_wines'],
            totalReviews: (int) $row['total_reviews'],
            myReviews: (int) $row['my_reviews'],
            averageRed: (float) $row['average_red'],
            averageWhite: (float) $row['average_white'],
        );
    }

    public function getScoringGenericStats(): array
    {
        $rows = $this->entityManager->getConnection()->fetchAllAssociative(<<<'SQL'
WITH wine_scores AS (
    SELECT
        w.id,
        AVG(r.score)::float AS avg_score
    FROM wine w
    LEFT JOIN review r ON r.wine_id = w.id AND r.score IS NOT NULL
    GROUP BY w.id
),
bucket_counts AS (
    SELECT
        CASE
            WHEN avg_score < 60 THEN '<60'
            WHEN avg_score >= 60 AND avg_score < 70 THEN '60-69'
            WHEN avg_score >= 70 AND avg_score < 80 THEN '70-79'
            WHEN avg_score >= 80 AND avg_score < 90 THEN '80-89'
            WHEN avg_score >= 90 THEN '90+'
            ELSE null
        END AS label,
        COUNT(*)::int AS count
    FROM wine_scores
    WHERE avg_score IS NOT NULL
    GROUP BY 1
)
SELECT bucket.label, COALESCE(bucket_counts.count, 0) AS count
FROM (VALUES ('90+', 1), ('80-89', 2), ('70-79', 3), ('60-69', 4), ('<60', 5)) AS bucket(label, sort_order)
LEFT JOIN bucket_counts ON bucket_counts.label = bucket.label
ORDER BY bucket.sort_order
SQL);

        return array_map(
            static fn (array $row): ScoreBucketStat => new ScoreBucketStat(
                label: (string) $row['label'],
                count: (int) $row['count'],
            ),
            $rows,
        );
    }

    public function getCoverageStats(int $userId): CoverageStats
    {
        $row = $this->entityManager->getConnection()->fetchAssociative(
            <<<'SQL'
WITH reviewed AS (
    SELECT COUNT(DISTINCT wine_id)::int AS reviewed_wines
    FROM review
),
score_stats AS (
    SELECT
        COALESCE(ROUND(AVG(score)::numeric, 1)::float, 0) AS avg_score,
        COALESCE(ROUND((percentile_cont(0.5) WITHIN GROUP (ORDER BY score))::numeric, 1)::float, 0) AS median_score
    FROM review
    WHERE score IS NOT NULL
)
SELECT
    (SELECT COUNT(*)::int FROM wine) AS total_wines,
    (SELECT reviewed_wines FROM reviewed) AS reviewed_wines,
    (SELECT COUNT(*)::int FROM review) AS total_reviews,
    COALESCE(ROUND(
        (SELECT reviewed_wines FROM reviewed) * 100.0 / NULLIF((SELECT COUNT(*) FROM wine), 0),
        1
    )::float, 0) AS review_coverage_pct,
    (SELECT avg_score FROM score_stats) AS avg_score,
    (SELECT median_score FROM score_stats) AS median_score,
    (SELECT COUNT(*)::int FROM review WHERE user_id = :user_id) AS my_reviews,
    (SELECT COUNT(DISTINCT user_id)::int FROM review) AS users_with_reviews
SQL,
            ['user_id' => $userId],
        );

        if (!is_array($row)) {
            return new CoverageStats(0, 0, 0, 0.0, 0.0, 0.0, 0, 0);
        }

        return new CoverageStats(
            totalWines: (int) $row['total_wines'],
            reviewedWines: (int) $row['reviewed_wines'],
            totalReviews: (int) $row['total_reviews'],
            reviewCoveragePct: (float) $row['review_coverage_pct'],
            avgScore: (float) $row['avg_score'],
            medianScore: (float) $row['median_score'],
            myReviews: (int) $row['my_reviews'],
            usersWithReviews: (int) $row['users_with_reviews'],
        );
    }

    public function getActivityStats(): ActivityStats
    {
        $rows = $this->entityManager->getConnection()->fetchAllAssociative(<<<'SQL'
WITH bounds AS (
    SELECT
        date_trunc('month', MIN(created_at))::date AS start_month,
        date_trunc('month', MAX(created_at))::date AS end_month
    FROM review
),
months AS (
    SELECT generate_series(start_month, end_month, interval '1 month')::date AS month_start
    FROM bounds
    WHERE start_month IS NOT NULL
      AND end_month IS NOT NULL
),
aggregated AS (
    SELECT
        date_trunc('month', created_at)::date AS month_start,
        COUNT(*)::int AS review_count,
        ROUND(AVG(score)::numeric, 1)::float AS avg_score,
        ROUND((percentile_cont(0.5) WITHIN GROUP (ORDER BY score) FILTER (WHERE score IS NOT NULL))::numeric, 1)::float AS median_score
    FROM review
    GROUP BY 1
)
SELECT
    to_char(m.month_start, 'YYYY-MM') AS month,
    COALESCE(a.review_count, 0) AS review_count,
    a.avg_score,
    a.median_score
FROM months m
LEFT JOIN aggregated a ON a.month_start = m.month_start
ORDER BY m.month_start ASC
SQL);

        $activityMonths = array_map(
            static fn (array $row): ActivityMonthStat => new ActivityMonthStat(
                month: (string) $row['month'],
                reviewCount: (int) $row['review_count'],
                avgScore: $row['avg_score'] === null ? null : (float) $row['avg_score'],
                medianScore: $row['median_score'] === null ? null : (float) $row['median_score'],
            ),
            $rows,
        );

        $bestMonth = null;
        $lastMonthReviews = 0;
        $avgReviewsPerMonth = 0.0;
        $lastActiveMonth = null;

        if ($activityMonths !== []) {
            $best = $activityMonths[0];

            foreach ($activityMonths as $item) {
                if ($item->reviewCount > $best->reviewCount) {
                    $best = $item;
                }
            }

            $bestMonth = new ActivityBestMonthStat(
                month: $best->month,
                reviews: $best->reviewCount,
            );

            $last = $activityMonths[count($activityMonths) - 1];
            $lastMonthReviews = $last->reviewCount;
            $lastActiveMonth = $last->month;
            $avgReviewsPerMonth = array_sum(array_map(
                static fn (ActivityMonthStat $item): int => $item->reviewCount,
                $activityMonths,
            )) / count($activityMonths);
        }

        return new ActivityStats(
            activityMonths: $activityMonths,
            lastMonthReviews: $lastMonthReviews,
            avgReviewsPerMonth: round($avgReviewsPerMonth, 1),
            bestMonth: $bestMonth,
            lastActiveMonth: $lastActiveMonth,
        );
    }

    public function getScoreDistributionStats(): ScoreDistributionStats
    {
        $bucketRows = $this->entityManager->getConnection()->fetchAllAssociative(<<<'SQL'
WITH wine_scores AS (
    SELECT
        w.id,
        AVG(r.score)::float AS avg_score
    FROM wine w
    LEFT JOIN review r ON r.wine_id = w.id AND r.score IS NOT NULL
    GROUP BY w.id
),
bucket_counts AS (
    SELECT
        CASE
            WHEN avg_score < 60 THEN '<60'
            WHEN avg_score < 70 THEN '60-69'
            WHEN avg_score < 80 THEN '70-79'
            WHEN avg_score < 90 THEN '80-89'
            WHEN avg_score >= 90 THEN '90+'
            ELSE null
        END AS label,
        COUNT(*)::int AS count
    FROM wine_scores
    WHERE avg_score IS NOT NULL
    GROUP BY 1
)
SELECT bucket.label, COALESCE(bucket_counts.count, 0) AS count
FROM (VALUES ('90+', 1), ('80-89', 2), ('70-79', 3), ('60-69', 4), ('<60', 5)) AS bucket(label, sort_order)
LEFT JOIN bucket_counts ON bucket_counts.label = bucket.label
ORDER BY bucket.sort_order
SQL);

        $statsRow = $this->entityManager->getConnection()->fetchAssociative(<<<'SQL'
WITH wine_scores AS (
    SELECT
        w.id,
        AVG(r.score)::float AS avg_score
    FROM wine w
    LEFT JOIN review r ON r.wine_id = w.id AND r.score IS NOT NULL
    GROUP BY w.id
)
SELECT
    COALESCE(ROUND(100.0 * COUNT(*) FILTER (WHERE avg_score >= 70) / NULLIF(COUNT(*), 0), 1)::float, 0) AS approved_70_pct,
    COALESCE(ROUND(100.0 * COUNT(*) FILTER (WHERE avg_score >= 80) / NULLIF(COUNT(*), 0), 1)::float, 0) AS great_80_pct,
    COALESCE(FLOOR(MIN(avg_score))::int, 0) AS min_score,
    COALESCE(CEIL(MAX(avg_score))::int, 0) AS max_score,
    COALESCE(ROUND(STDDEV_POP(avg_score)::numeric, 2)::float, 0) AS std_dev
FROM wine_scores
WHERE avg_score IS NOT NULL
SQL);

        return new ScoreDistributionStats(
            buckets: array_map(
                static fn (array $row): ScoreDistributionBucketStat => new ScoreDistributionBucketStat(
                    label: (string) $row['label'],
                    count: (int) $row['count'],
                ),
                $bucketRows,
            ),
            approved70Pct: (float) ($statsRow['approved_70_pct'] ?? 0),
            great80Pct: (float) ($statsRow['great_80_pct'] ?? 0),
            minScore: (int) ($statsRow['min_score'] ?? 0),
            maxScore: (int) ($statsRow['max_score'] ?? 0),
            stdDev: (float) ($statsRow['std_dev'] ?? 0),
        );
    }

    public function getValueStats(): ValueStats
    {
        $summaryRow = $this->entityManager->getConnection()->fetchAssociative(<<<'SQL'
WITH wine_avg AS (
    SELECT
        w.id,
        MAX(wp.price_paid)::float AS price_paid,
        AVG(r.score)::float AS avg_score
    FROM wine w
    LEFT JOIN wine_purchase wp ON wp.wine_id = w.id
    LEFT JOIN review r ON r.wine_id = w.id AND r.score IS NOT NULL
    GROUP BY w.id
),
filtered AS (
    SELECT *
    FROM wine_avg
    WHERE avg_score IS NOT NULL
      AND price_paid IS NOT NULL
)
SELECT
    COALESCE(ROUND(CORR(price_paid, avg_score)::numeric, 3)::float, 0) AS price_score_correlation,
    COALESCE(ROUND(REGR_SLOPE(avg_score, price_paid)::numeric, 3)::float, 0) AS regression_slope,
    COALESCE(ROUND(REGR_INTERCEPT(avg_score, price_paid)::numeric, 3)::float, 0) AS regression_intercept,
    COALESCE(ROUND((percentile_cont(0.5) WITHIN GROUP (ORDER BY price_paid))::numeric, 2)::float, 0) AS median_price,
    COALESCE(MIN(price_paid)::float, 0) AS min_price,
    COALESCE(MAX(price_paid)::float, 0) AS max_price,
    COUNT(*) FILTER (WHERE price_paid < 10 AND avg_score >= 80)::int AS under_10_high_score_count,
    COALESCE(ROUND(100.0 * COUNT(*) FILTER (WHERE price_paid < 10 AND avg_score >= 80) / NULLIF(COUNT(*) FILTER (WHERE price_paid < 10), 0), 1)::float, 0) AS under_10_high_score_pct,
    80 AS under_10_high_score_threshold
FROM filtered
SQL);

        $priceBandRows = $this->entityManager->getConnection()->fetchAllAssociative(<<<'SQL'
WITH wine_avg AS (
    SELECT
        w.id,
        MAX(wp.price_paid)::float AS price_paid,
        AVG(r.score)::float AS avg_score
    FROM wine w
    LEFT JOIN wine_purchase wp ON wp.wine_id = w.id
    LEFT JOIN review r ON r.wine_id = w.id AND r.score IS NOT NULL
    GROUP BY w.id
)
SELECT
    CASE
        WHEN price_paid < 10 THEN '<10'
        WHEN price_paid < 15 THEN '10-15'
        WHEN price_paid < 25 THEN '15-25'
        ELSE '25+'
    END AS label,
    COUNT(*)::int AS wines,
    ROUND(AVG(avg_score)::numeric, 1)::float AS avg_score
FROM wine_avg
WHERE avg_score IS NOT NULL
  AND price_paid IS NOT NULL
GROUP BY 1
ORDER BY MIN(price_paid)
SQL);

        $topValueRows = $this->entityManager->getConnection()->fetchAllAssociative(<<<'SQL'
WITH wine_avg AS (
    SELECT
        w.id AS wine_id,
        w.name,
        d.name AS do_name,
        MAX(wp.price_paid)::float AS price,
        AVG(r.score)::float AS avg_score
    FROM wine w
    LEFT JOIN designation_of_origin d ON d.id = w.do_id
    LEFT JOIN wine_purchase wp ON wp.wine_id = w.id
    LEFT JOIN review r ON r.wine_id = w.id AND r.score IS NOT NULL
    GROUP BY w.id, w.name, d.name
)
SELECT
    wine_id,
    name,
    do_name,
    price,
    ROUND(avg_score::numeric, 1)::float AS avg_score,
    ROUND((avg_score / NULLIF(price, 0))::numeric, 2)::float AS value_index
FROM wine_avg
WHERE avg_score IS NOT NULL
  AND price IS NOT NULL
ORDER BY value_index DESC
LIMIT 10
SQL);

        return new ValueStats(
            priceScoreCorrelation: (float) ($summaryRow['price_score_correlation'] ?? 0),
            regressionSlope: (float) ($summaryRow['regression_slope'] ?? 0),
            regressionIntercept: (float) ($summaryRow['regression_intercept'] ?? 0),
            medianPrice: (float) ($summaryRow['median_price'] ?? 0),
            minPrice: (float) ($summaryRow['min_price'] ?? 0),
            maxPrice: (float) ($summaryRow['max_price'] ?? 0),
            priceBands: array_map(
                static fn (array $row): ValuePriceBandStat => new ValuePriceBandStat(
                    label: (string) $row['label'],
                    wines: (int) $row['wines'],
                    avgScore: $row['avg_score'] === null ? null : (float) $row['avg_score'],
                ),
                $priceBandRows,
            ),
            topValueWines: array_map(
                static fn (array $row): ValueTopWineStat => new ValueTopWineStat(
                    wineId: (int) $row['wine_id'],
                    name: (string) $row['name'],
                    doName: $row['do_name'] === null ? null : (string) $row['do_name'],
                    price: (float) $row['price'],
                    avgScore: (float) $row['avg_score'],
                    valueIndex: (float) $row['value_index'],
                ),
                $topValueRows,
            ),
            under10HighScoreCount: (int) ($summaryRow['under_10_high_score_count'] ?? 0),
            under10HighScorePct: (float) ($summaryRow['under_10_high_score_pct'] ?? 0),
            under10HighScoreThreshold: (int) ($summaryRow['under_10_high_score_threshold'] ?? 80),
        );
    }

    public function getCatalogHealthStats(): CatalogHealthStats
    {
        $healthRow = $this->entityManager->getConnection()->fetchAssociative(<<<'SQL'
WITH wine_health AS (
    SELECT
        w.id,
        COUNT(DISTINCT r.id) AS review_count,
        COUNT(DISTINCT wp.id) AS photo_count,
        COUNT(DISTINCT wg.grape_id) AS grape_count,
        COUNT(DISTINCT wa.id) AS award_count
    FROM wine w
    LEFT JOIN review r ON r.wine_id = w.id
    LEFT JOIN wine_photo wp ON wp.wine_id = w.id
    LEFT JOIN wine_grape wg ON wg.wine_id = w.id
    LEFT JOIN wine_award wa ON wa.wine_id = w.id
    GROUP BY w.id
)
SELECT
    COUNT(*) FILTER (WHERE review_count = 0)::int AS wines_without_reviews,
    COUNT(*) FILTER (WHERE photo_count = 0)::int AS wines_without_photos,
    COUNT(*) FILTER (WHERE award_count >= 1)::int AS wines_with_awards,
    COUNT(*) FILTER (WHERE award_count = 0)::int AS wines_without_awards,
    ROUND(100.0 * COUNT(*) FILTER (WHERE photo_count >= 1) / COUNT(*), 1)::float AS photo_coverage_pct,
    ROUND(100.0 * COUNT(*) FILTER (WHERE grape_count >= 1) / COUNT(*), 1)::float AS grape_coverage_pct,
    ROUND(100.0 * COUNT(*) FILTER (WHERE review_count >= 1) / COUNT(*), 1)::float AS review_coverage_pct
FROM wine_health
SQL);

        $assetRow = $this->entityManager->getConnection()->fetchAssociative(<<<'SQL'
SELECT
    COALESCE(ROUND(100.0 * COUNT(*) FILTER (WHERE do_logo IS NOT NULL) / NULLIF(COUNT(*), 0), 1)::float, 0) AS do_logo_coverage_pct,
    COALESCE(ROUND(100.0 * COUNT(*) FILTER (WHERE region_logo IS NOT NULL) / NULLIF(COUNT(*), 0), 1)::float, 0) AS region_logo_coverage_pct,
    COALESCE(ROUND(100.0 * COUNT(*) FILTER (WHERE map_data IS NOT NULL) / NULLIF(COUNT(*), 0), 1)::float, 0) AS do_map_coverage_pct
FROM designation_of_origin
SQL);

        $placesRow = $this->entityManager->getConnection()->fetchAssociative(<<<'SQL'
SELECT
    COALESCE(ROUND(100.0 * COUNT(*) FILTER (WHERE map_data IS NOT NULL) / NULLIF(COUNT(*), 0), 1)::float, 0) AS places_with_map_pct
FROM place
SQL);

        return new CatalogHealthStats(
            winesWithoutReviews: (int) ($healthRow['wines_without_reviews'] ?? 0),
            winesWithoutPhotos: (int) ($healthRow['wines_without_photos'] ?? 0),
            winesWithAwards: (int) ($healthRow['wines_with_awards'] ?? 0),
            winesWithoutAwards: (int) ($healthRow['wines_without_awards'] ?? 0),
            photoCoveragePct: (float) ($healthRow['photo_coverage_pct'] ?? 0),
            grapeCoveragePct: (float) ($healthRow['grape_coverage_pct'] ?? 0),
            reviewCoveragePct: (float) ($healthRow['review_coverage_pct'] ?? 0),
            doLogoCoveragePct: (float) ($assetRow['do_logo_coverage_pct'] ?? 0),
            regionLogoCoveragePct: (float) ($assetRow['region_logo_coverage_pct'] ?? 0),
            doMapCoveragePct: (float) ($assetRow['do_map_coverage_pct'] ?? 0),
            placesWithMapPct: (float) ($placesRow['places_with_map_pct'] ?? 0),
        );
    }

    public function getPairAgreementStats(): PairAgreementStats
    {
        $summaryRow = $this->entityManager->getConnection()->fetchAssociative(<<<'SQL'
WITH paired AS (
    SELECT
        ABS(r1.score - r2.score) AS diff
    FROM review r1
    JOIN review r2
      ON r1.wine_id = r2.wine_id
     AND r1.user_id < r2.user_id
    WHERE r1.score IS NOT NULL
      AND r2.score IS NOT NULL
)
SELECT
    COUNT(*)::int AS pairs_count,
    COALESCE(ROUND(AVG(diff)::numeric, 2)::float, 0) AS avg_diff,
    COALESCE(ROUND(100.0 * COUNT(*) FILTER (WHERE diff >= 10) / NULLIF(COUNT(*), 0), 1)::float, 0) AS diff_ge_10_pct,
    COALESCE(ROUND(100.0 * COUNT(*) FILTER (WHERE diff >= 15) / NULLIF(COUNT(*), 0), 1)::float, 0) AS diff_ge_15_pct
FROM paired
SQL);

        $scatterRows = $this->entityManager->getConnection()->fetchAllAssociative(<<<'SQL'
SELECT
    r1.wine_id,
    w.name AS wine_name,
    d.name AS do_name,
    r1.score AS user_a_score,
    r2.score AS user_b_score,
    ABS(r1.score - r2.score) AS diff
FROM review r1
JOIN review r2
  ON r1.wine_id = r2.wine_id
 AND r1.user_id < r2.user_id
JOIN wine w ON w.id = r1.wine_id
LEFT JOIN designation_of_origin d ON d.id = w.do_id
WHERE r1.score IS NOT NULL
  AND r2.score IS NOT NULL
ORDER BY diff DESC, w.name ASC
LIMIT 50
SQL);

        $byDoRows = $this->entityManager->getConnection()->fetchAllAssociative(<<<'SQL'
WITH paired AS (
    SELECT
        d.name AS do_name,
        ABS(r1.score - r2.score) AS diff
    FROM review r1
    JOIN review r2
      ON r1.wine_id = r2.wine_id
     AND r1.user_id < r2.user_id
    JOIN wine w ON w.id = r1.wine_id
    LEFT JOIN designation_of_origin d ON d.id = w.do_id
    WHERE r1.score IS NOT NULL
      AND r2.score IS NOT NULL
)
SELECT
    do_name,
    COUNT(*)::int AS compared_wines,
    ROUND(AVG(diff)::numeric, 1)::float AS avg_diff
FROM paired
GROUP BY do_name
HAVING COUNT(*) >= 2
ORDER BY avg_diff DESC, compared_wines DESC
LIMIT 10
SQL);

        $pairsCount = (int) ($summaryRow['pairs_count'] ?? 0);
        $avgDiff = (float) ($summaryRow['avg_diff'] ?? 0);
        $diffGe10Pct = (float) ($summaryRow['diff_ge_10_pct'] ?? 0);
        $diffGe15Pct = (float) ($summaryRow['diff_ge_15_pct'] ?? 0);
        $syncIndex = max(0.0, round(100 - ($avgDiff * 10) - $diffGe10Pct, 1));

        return new PairAgreementStats(
            pairsCount: $pairsCount,
            avgDiff: $avgDiff,
            diffGe10Pct: $diffGe10Pct,
            diffGe15Pct: $diffGe15Pct,
            syncIndex: $syncIndex,
            scatterPoints: array_map(
                static fn (array $row): PairAgreementScatterPointStat => new PairAgreementScatterPointStat(
                    wineId: (int) $row['wine_id'],
                    wineName: (string) $row['wine_name'],
                    doName: $row['do_name'] === null ? null : (string) $row['do_name'],
                    userAScore: (int) $row['user_a_score'],
                    userBScore: (int) $row['user_b_score'],
                    diff: (int) $row['diff'],
                ),
                $scatterRows,
            ),
            byDo: array_map(
                static fn (array $row): PairAgreementByDoStat => new PairAgreementByDoStat(
                    doName: $row['do_name'] === null ? null : (string) $row['do_name'],
                    comparedWines: (int) $row['compared_wines'],
                    avgDiff: (float) $row['avg_diff'],
                ),
                $byDoRows,
            ),
        );
    }
}
