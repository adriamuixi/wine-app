<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Repos;

use App\Domain\Model\GenericStats;
use App\Domain\Model\ReviewMonthStats;
use App\Domain\Model\ScoreBucketStat;
use App\Domain\Repository\ReviewStatsRepository;
use Doctrine\ORM\EntityManagerInterface;

final readonly class DoctrineReviewStatsRepository implements ReviewStatsRepository
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
}
