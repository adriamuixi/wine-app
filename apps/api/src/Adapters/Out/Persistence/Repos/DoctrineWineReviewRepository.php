<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Repos;

use App\Application\UseCases\Review\ListReviews\ListReviewsQuery;
use App\Application\UseCases\Review\ListReviews\ListReviewsResult;
use App\Application\UseCases\Review\ListReviews\ListReviewsSort;
use App\Application\UseCases\Review\ListReviews\ReviewListItemView;
use App\Domain\Enum\ReviewBullet;
use App\Domain\Model\WineReview;
use App\Domain\Repository\WineReviewRepository;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\ParameterType;
use Doctrine\ORM\EntityManagerInterface;

final readonly class DoctrineWineReviewRepository implements WineReviewRepository
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
    }

    public function findById(int $id): ?WineReview
    {
        $row = $this->entityManager->getConnection()->fetchAssociative(
            <<<'SQL'
SELECT id, user_id, wine_id, aroma, appearance, palate_entry, body, persistence, score, created_at
FROM review
WHERE id = :id
LIMIT 1
SQL,
            ['id' => $id],
        );

        if (!is_array($row)) {
            return null;
        }

        $bulletsRows = $this->entityManager->getConnection()->fetchFirstColumn(
            'SELECT bullet FROM review_bullets WHERE review_id = :review_id ORDER BY bullet ASC',
            ['review_id' => (int) $row['id']],
        );

        /** @var list<ReviewBullet> $bullets */
        $bullets = array_map(
            static fn (mixed $bullet): ReviewBullet => ReviewBullet::from((string) $bullet),
            $bulletsRows,
        );

        return new WineReview(
            id: (int) $row['id'],
            userId: (int) $row['user_id'],
            wineId: (int) $row['wine_id'],
            aroma: (int) $row['aroma'],
            appearance: (int) $row['appearance'],
            palateEntry: (int) $row['palate_entry'],
            body: (int) $row['body'],
            persistence: (int) $row['persistence'],
            bullets: $bullets,
            score: null === $row['score'] ? null : (int) $row['score'],
            createdAt: new \DateTimeImmutable((string) $row['created_at']),
        );
    }

    public function existsByUserAndWine(int $userId, int $wineId): bool
    {
        $count = $this->entityManager->getConnection()->fetchOne(
            'SELECT COUNT(*) FROM review WHERE user_id = :user_id AND wine_id = :wine_id',
            [
                'user_id' => $userId,
                'wine_id' => $wineId,
            ],
        );

        return (int) $count > 0;
    }

    public function create(WineReview $review): int
    {
        return $this->entityManager->getConnection()->transactional(function () use ($review): int {
            $id = $this->entityManager->getConnection()->fetchOne(
                <<<'SQL'
INSERT INTO review (user_id, wine_id, score, aroma, appearance, palate_entry, body, persistence, created_at)
VALUES (:user_id, :wine_id, :score, :aroma, :appearance, :palate_entry, :body, :persistence, :created_at)
RETURNING id
SQL,
                [
                    'user_id' => $review->userId,
                    'wine_id' => $review->wineId,
                    'score' => $review->score,
                    'aroma' => $review->aroma,
                    'appearance' => $review->appearance,
                    'palate_entry' => $review->palateEntry,
                    'body' => $review->body,
                    'persistence' => $review->persistence,
                    'created_at' => ($review->createdAt ?? new \DateTimeImmutable('now'))->format('Y-m-d H:i:sP'),
                ],
            );

            $reviewId = (int) $id;

            foreach ($review->bullets as $bullet) {
                $this->entityManager->getConnection()->executeStatement(
                    'INSERT INTO review_bullets (review_id, bullet) VALUES (:review_id, :bullet)',
                    [
                        'review_id' => $reviewId,
                        'bullet' => $bullet->value,
                    ],
                );
            }

            return $reviewId;
        });
    }

    public function update(WineReview $review): void
    {
        if (null === $review->id) {
            throw new \InvalidArgumentException('review id is required for update.');
        }

        $this->entityManager->getConnection()->transactional(function () use ($review): void {
            $this->entityManager->getConnection()->executeStatement(
                <<<'SQL'
UPDATE review
SET aroma = :aroma,
    appearance = :appearance,
    palate_entry = :palate_entry,
    body = :body,
    score = :score,
    persistence = :persistence,
    created_at = :created_at
WHERE id = :id
SQL,
                [
                    'id' => $review->id,
                    'aroma' => $review->aroma,
                    'appearance' => $review->appearance,
                    'palate_entry' => $review->palateEntry,
                    'body' => $review->body,
                    'score' => $review->score,
                    'persistence' => $review->persistence,
                    'created_at' => ($review->createdAt ?? new \DateTimeImmutable('now'))->format('Y-m-d H:i:sP'),
                ],
            );

            $this->entityManager->getConnection()->executeStatement(
                'DELETE FROM review_bullets WHERE review_id = :review_id',
                ['review_id' => $review->id],
            );

            foreach ($review->bullets as $bullet) {
                $this->entityManager->getConnection()->executeStatement(
                    'INSERT INTO review_bullets (review_id, bullet) VALUES (:review_id, :bullet)',
                    [
                        'review_id' => $review->id,
                        'bullet' => $bullet->value,
                    ],
                );
            }
        });
    }

    public function deleteById(int $id): void
    {
        $this->entityManager->getConnection()->executeStatement(
            'DELETE FROM review WHERE id = :id',
            ['id' => $id],
        );
    }

    public function findPaginated(ListReviewsQuery $query): ListReviewsResult
    {
        $connection = $this->entityManager->getConnection();
        $offset = ($query->page - 1) * $query->limit;
        $sortColumn = $this->resolveSortColumn($query->sortBy);
        $sortDirection = strtoupper($query->sortDir);

        $totalItems = (int) $connection->fetchOne('SELECT count(*) FROM review');

        $rows = $connection->fetchAllAssociative(
            sprintf(
                <<<'SQL'
SELECT
    r.id,
    r.user_id,
    u.name AS user_name,
    u.lastname AS user_lastname,
    r.wine_id,
    w.name AS wine_name,
    d.id AS do_id,
    d.name AS do_name,
    r.score,
    r.aroma,
    r.appearance,
    r.palate_entry,
    r.body,
    r.persistence,
    r.created_at
FROM review r
INNER JOIN users u ON u.id = r.user_id
INNER JOIN wine w ON w.id = r.wine_id
LEFT JOIN designation_of_origin d ON d.id = w.do_id
ORDER BY %s %s NULLS LAST, r.id DESC
LIMIT :limit OFFSET :offset
SQL,
                $sortColumn,
                $sortDirection,
            ),
            [
                'limit' => $query->limit,
                'offset' => $offset,
            ],
            [
                'limit' => ParameterType::INTEGER,
                'offset' => ParameterType::INTEGER,
            ],
        );

        $reviewIds = array_map(static fn (array $row): int => (int) $row['id'], $rows);
        /** @var array<int,list<string>> $bulletsByReviewId */
        $bulletsByReviewId = [];

        if ([] !== $reviewIds) {
            $bulletRows = $connection->fetchAllAssociative(
                <<<'SQL'
SELECT review_id, bullet
FROM review_bullets
WHERE review_id IN (:review_ids)
ORDER BY review_id ASC, bullet ASC
SQL,
                ['review_ids' => $reviewIds],
                ['review_ids' => ArrayParameterType::INTEGER],
            );

            foreach ($bulletRows as $row) {
                $reviewId = (int) $row['review_id'];
                if (!array_key_exists($reviewId, $bulletsByReviewId)) {
                    $bulletsByReviewId[$reviewId] = [];
                }

                $bulletsByReviewId[$reviewId][] = (string) $row['bullet'];
            }
        }

        $items = array_map(
            fn (array $row): ReviewListItemView => new ReviewListItemView(
                id: (int) $row['id'],
                userId: (int) $row['user_id'],
                userName: (string) $row['user_name'],
                userLastname: (string) $row['user_lastname'],
                wineId: (int) $row['wine_id'],
                wineName: (string) $row['wine_name'],
                doId: null === $row['do_id'] ? null : (int) $row['do_id'],
                doName: null === $row['do_name'] ? null : (string) $row['do_name'],
                score: null === $row['score'] ? null : (int) $row['score'],
                aroma: (int) $row['aroma'],
                appearance: (int) $row['appearance'],
                palateEntry: (int) $row['palate_entry'],
                body: (int) $row['body'],
                persistence: (int) $row['persistence'],
                bullets: $bulletsByReviewId[(int) $row['id']] ?? [],
                createdAt: $this->toIso8601((string) $row['created_at']),
            ),
            $rows,
        );

        $totalPages = 0 === $totalItems ? 0 : (int) ceil($totalItems / $query->limit);

        return new ListReviewsResult(
            items: $items,
            page: $query->page,
            limit: $query->limit,
            totalItems: $totalItems,
            totalPages: $totalPages,
        );
    }

    private function resolveSortColumn(string $sortBy): string
    {
        return match ($sortBy) {
            ListReviewsSort::NAME => 'w.name',
            ListReviewsSort::DO => 'd.name',
            default => 'r.score',
        };
    }

    private function toIso8601(string $value): string
    {
        return (new \DateTimeImmutable($value))->format(\DateTimeInterface::ATOM);
    }
}
