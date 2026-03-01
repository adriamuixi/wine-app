<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Repos;

use App\Domain\Enum\ReviewBullet;
use App\Domain\Model\WineReview;
use App\Domain\Repository\WineReviewRepository;
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
SELECT id, user_id, wine_id, intensity_aroma, sweetness, acidity, tannin, body, persistence, score, created_at
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
            intensityAroma: (int) $row['intensity_aroma'],
            sweetness: (int) $row['sweetness'],
            acidity: (int) $row['acidity'],
            tannin: null === $row['tannin'] ? null : (int) $row['tannin'],
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
INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
VALUES (:user_id, :wine_id, :score, :intensity_aroma, :sweetness, :acidity, :tannin, :body, :persistence, NOW())
RETURNING id
SQL,
                [
                    'user_id' => $review->userId,
                    'wine_id' => $review->wineId,
                    'score' => $review->score,
                    'intensity_aroma' => $review->intensityAroma,
                    'sweetness' => $review->sweetness,
                    'acidity' => $review->acidity,
                    'tannin' => $review->tannin,
                    'body' => $review->body,
                    'persistence' => $review->persistence,
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
SET intensity_aroma = :intensity_aroma,
    sweetness = :sweetness,
    acidity = :acidity,
    tannin = :tannin,
    body = :body,
    persistence = :persistence
WHERE id = :id
SQL,
                [
                    'id' => $review->id,
                    'intensity_aroma' => $review->intensityAroma,
                    'sweetness' => $review->sweetness,
                    'acidity' => $review->acidity,
                    'tannin' => $review->tannin,
                    'body' => $review->body,
                    'persistence' => $review->persistence,
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
}
