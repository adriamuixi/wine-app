<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Review\CreateReview;

use App\Application\UseCases\Review\CreateReview\CreateReviewCommand;
use App\Application\UseCases\Review\CreateReview\CreateReviewAlreadyExists;
use App\Application\UseCases\Review\CreateReview\CreateReviewHandler;
use App\Application\UseCases\Review\CreateReview\CreateReviewValidationException;
use App\Domain\Enum\ReviewBullet;
use App\Domain\Model\WineReview;
use App\Domain\Repository\WineReviewRepository;
use PHPUnit\Framework\TestCase;

final class CreateReviewHandlerTest extends TestCase
{
    public function testCreateReturnsId(): void
    {
        $repository = new InMemoryWineReviewRepository();
        $handler = new CreateReviewHandler($repository);

        $result = $handler->handle(new CreateReviewCommand(
            userId: 1,
            wineId: 10,
            intensityAroma: 4,
            sweetness: 2,
            acidity: 3,
            tannin: 2,
            body: 4,
            persistence: 4,
            bullets: [ReviewBullet::Floral],
            score: 88,
        ));

        self::assertSame(1, $result->id);
        self::assertNotNull($repository->findById(1));
    }

    public function testCreateThrowsValidationForInvalidData(): void
    {
        $repository = new InMemoryWineReviewRepository();
        $handler = new CreateReviewHandler($repository);

        $this->expectException(CreateReviewValidationException::class);

        $handler->handle(new CreateReviewCommand(
            userId: 1,
            wineId: 10,
            intensityAroma: 6,
            sweetness: 2,
            acidity: 3,
            tannin: 2,
            body: 4,
            persistence: 4,
        ));
    }

    public function testCreateMapsDuplicateToAlreadyExistsException(): void
    {
        $repository = new InMemoryWineReviewRepository(throwAlreadyExists: true);
        $handler = new CreateReviewHandler($repository);

        $this->expectException(CreateReviewAlreadyExists::class);

        $handler->handle(new CreateReviewCommand(
            userId: 1,
            wineId: 10,
            intensityAroma: 4,
            sweetness: 2,
            acidity: 3,
            tannin: 2,
            body: 4,
            persistence: 4,
        ));
    }
}

final class InMemoryWineReviewRepository implements WineReviewRepository
{
    /** @var array<int, WineReview> */
    private array $items = [];

    private int $nextId = 1;

    public function __construct(private readonly bool $throwAlreadyExists = false)
    {
    }

    public function findById(int $id): ?WineReview
    {
        return $this->items[$id] ?? null;
    }

    public function existsByUserAndWine(int $userId, int $wineId): bool
    {
        return $this->throwAlreadyExists;
    }

    public function create(WineReview $review): int
    {
        $id = $this->nextId++;
        $this->items[$id] = new WineReview(
            id: $id,
            userId: $review->userId,
            wineId: $review->wineId,
            intensityAroma: $review->intensityAroma,
            sweetness: $review->sweetness,
            acidity: $review->acidity,
            tannin: $review->tannin,
            body: $review->body,
            persistence: $review->persistence,
            bullets: $review->bullets,
            score: $review->score,
            createdAt: new \DateTimeImmutable('2026-03-01T10:00:00+00:00'),
        );

        return $id;
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
