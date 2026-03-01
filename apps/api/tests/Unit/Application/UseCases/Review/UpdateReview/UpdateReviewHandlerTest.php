<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Review\UpdateReview;

use App\Application\UseCases\Review\UpdateReview\UpdateReviewCommand;
use App\Application\UseCases\Review\UpdateReview\UpdateReviewHandler;
use App\Application\UseCases\Review\UpdateReview\UpdateReviewNotFound;
use App\Application\UseCases\Review\UpdateReview\UpdateReviewValidationException;
use App\Domain\Enum\ReviewBullet;
use App\Domain\Model\WineReview;
use App\Domain\Repository\WineReviewRepository;
use PHPUnit\Framework\TestCase;

final class UpdateReviewHandlerTest extends TestCase
{
    public function testUpdatePersistsReview(): void
    {
        $repository = new InMemoryWineReviewRepository();
        $handler = new UpdateReviewHandler($repository);

        $handler->handle(new UpdateReviewCommand(
            id: 1,
            intensityAroma: 5,
            sweetness: 2,
            acidity: 2,
            tannin: 1,
            body: 5,
            persistence: 4,
            bullets: [ReviewBullet::Elegante],
            score: 90,
        ));

        $saved = $repository->findById(1);
        self::assertNotNull($saved);
        self::assertSame(5, $saved->intensityAroma);
        self::assertSame(['elegante'], $saved->bulletsAsValues());
    }

    public function testUpdateThrowsWhenReviewMissing(): void
    {
        $repository = new InMemoryWineReviewRepository();
        $handler = new UpdateReviewHandler($repository);

        $this->expectException(UpdateReviewNotFound::class);

        $handler->handle(new UpdateReviewCommand(
            id: 99,
            intensityAroma: 5,
            sweetness: 2,
            acidity: 2,
            tannin: 1,
            body: 5,
            persistence: 4,
        ));
    }

    public function testUpdateThrowsWhenScoreChanges(): void
    {
        $repository = new InMemoryWineReviewRepository();
        $handler = new UpdateReviewHandler($repository);

        $this->expectException(UpdateReviewValidationException::class);

        $handler->handle(new UpdateReviewCommand(
            id: 1,
            intensityAroma: 5,
            sweetness: 2,
            acidity: 2,
            tannin: 1,
            body: 5,
            persistence: 4,
            score: 91,
        ));
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
            userId: 4,
            wineId: 2,
            intensityAroma: 3,
            sweetness: 2,
            acidity: 3,
            tannin: 2,
            body: 3,
            persistence: 3,
            bullets: [ReviewBullet::Floral],
            score: 90,
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
        $this->items[1] = $review;

        return 1;
    }

    public function update(WineReview $review): void
    {
        if (null === $review->id) {
            throw new \InvalidArgumentException('id required');
        }

        $this->items[$review->id] = $review;
    }

    public function deleteById(int $id): void
    {
        unset($this->items[$id]);
    }
}
