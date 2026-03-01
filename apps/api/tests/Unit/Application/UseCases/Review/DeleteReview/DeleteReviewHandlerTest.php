<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Review\DeleteReview;

use App\Application\UseCases\Review\DeleteReview\DeleteReviewHandler;
use App\Application\UseCases\Review\DeleteReview\DeleteReviewNotFound;
use App\Domain\Enum\ReviewBullet;
use App\Domain\Model\WineReview;
use App\Domain\Repository\WineReviewRepository;
use PHPUnit\Framework\TestCase;

final class DeleteReviewHandlerTest extends TestCase
{
    public function testDeleteRemovesReview(): void
    {
        $repo = new InMemoryWineReviewRepository();
        $handler = new DeleteReviewHandler($repo);

        $handler->handle(1);

        self::assertNull($repo->findById(1));
    }

    public function testDeleteThrowsWhenMissing(): void
    {
        $repo = new InMemoryWineReviewRepository();
        $handler = new DeleteReviewHandler($repo);

        $this->expectException(DeleteReviewNotFound::class);
        $handler->handle(999);
    }
}

final class InMemoryWineReviewRepository implements WineReviewRepository
{
    /** @var array<int, WineReview> */
    private array $items = [];

    public function __construct()
    {
        $this->items[1] = new WineReview(
            id: 1,
            userId: 1,
            wineId: 2,
            intensityAroma: 4,
            sweetness: 2,
            acidity: 3,
            tannin: 2,
            body: 4,
            persistence: 4,
            bullets: [ReviewBullet::Floral],
            score: 88,
            createdAt: new \DateTimeImmutable('2026-03-01T10:00:00+00:00'),
        );
    }

    public function findById(int $id): ?WineReview
    {
        return $this->items[$id] ?? null;
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
        unset($this->items[$id]);
    }
}
