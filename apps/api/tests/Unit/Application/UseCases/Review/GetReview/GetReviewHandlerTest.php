<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Review\GetReview;

use App\Application\UseCases\Review\GetReview\GetReviewHandler;
use App\Domain\Enum\ReviewBullet;
use App\Domain\Model\WineReview;
use App\Domain\Repository\WineReviewRepository;
use PHPUnit\Framework\TestCase;

final class GetReviewHandlerTest extends TestCase
{
    public function testReturnsReviewById(): void
    {
        $handler = new GetReviewHandler(new InMemoryWineReviewRepository());

        $review = $handler->handle(7);

        self::assertNotNull($review);
        self::assertSame(7, $review->id);
    }

    public function testReturnsNullWhenMissing(): void
    {
        $handler = new GetReviewHandler(new InMemoryWineReviewRepository());

        self::assertNull($handler->handle(99));
    }
}

final class InMemoryWineReviewRepository implements WineReviewRepository
{
    public function findById(int $id): ?WineReview
    {
        if (7 !== $id) {
            return null;
        }

        return new WineReview(
            id: 7,
            userId: 2,
            wineId: 8,
            intensityAroma: 3,
            sweetness: 2,
            acidity: 4,
            tannin: 3,
            body: 4,
            persistence: 4,
            bullets: [ReviewBullet::Mineral],
            score: 86,
            createdAt: new \DateTimeImmutable('2026-03-01T10:00:00+00:00'),
        );
    }

    public function existsByUserAndWine(int $userId, int $wineId): bool
    {
        return false;
    }

    public function create(WineReview $review): int
    {
        return 1;
    }

    public function update(WineReview $review): void
    {
    }

    public function deleteById(int $id): void
    {
    }
}
