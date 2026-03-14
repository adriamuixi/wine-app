<?php

declare(strict_types=1);

namespace App\Tests\Unit\Adapters\In\Http;

use App\Adapters\In\Http\ReviewController;
use App\Application\Ports\AuthSessionManager;
use App\Application\UseCases\Review\CreateReview\CreateReviewHandler;
use App\Application\UseCases\Review\DeleteReview\DeleteReviewHandler;
use App\Application\UseCases\Review\GetReview\GetReviewHandler;
use App\Application\UseCases\Review\UpdateReview\UpdateReviewHandler;
use App\Domain\Enum\ReviewBullet;
use App\Domain\Model\WineReview;
use App\Domain\Repository\WineReviewRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

final class ReviewControllerTest extends TestCase
{
    public function testCreateRequiresAuthentication(): void
    {
        $controller = $this->controller(authenticatedUserId: null);
        $request = Request::create(
            '/api/wines/2/reviews',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'aroma' => 4,
                'appearance' => 2,
                'palate_entry' => 3,
                'body' => 4,
                'persistence' => 4,
                'bullets' => ['floral'],
                'score' => 88,
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->create(2, $request);

        self::assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
    }

    public function testCreateReturnsCreated(): void
    {
        [$controller, $repository] = $this->controllerWithRepository();
        $request = Request::create(
            '/api/wines/2/reviews',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'aroma' => 4,
                'appearance' => 2,
                'palate_entry' => 3,
                'body' => 4,
                'persistence' => 4,
                'bullets' => ['floral'],
                'score' => 88,
                'created_at' => '2025-12-24',
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->create(2, $request);

        self::assertSame(Response::HTTP_CREATED, $response->getStatusCode());
        $createdReview = $repository->findById(2);
        self::assertNotNull($createdReview);
        self::assertSame('2025-12-24T00:00:00+00:00', $createdReview->createdAt?->format(DATE_ATOM));
    }

    public function testCreateReturnsConflictWhenReviewAlreadyExists(): void
    {
        $controller = $this->controller(throwAlreadyExists: true);
        $request = Request::create(
            '/api/wines/2/reviews',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'aroma' => 4,
                'appearance' => 2,
                'palate_entry' => 3,
                'body' => 4,
                'persistence' => 4,
                'bullets' => ['floral'],
                'score' => 88,
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->create(2, $request);

        self::assertSame(Response::HTTP_CONFLICT, $response->getStatusCode());
    }

    public function testGetByIdReturnsNotFound(): void
    {
        $controller = $this->controller();

        $response = $controller->getById(2, 999);

        self::assertSame(Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testUpdateReturnsNoContent(): void
    {
        [$controller, $repository] = $this->controllerWithRepository();
        $request = Request::create(
            '/api/wines/2/reviews/1',
            'PUT',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'aroma' => 5,
                'appearance' => 2,
                'palate_entry' => 2,
                'body' => 4,
                'persistence' => 4,
                'bullets' => ['powerful'],
                'score' => 88,
                'created_at' => '2025-11-03',
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->update(2, 1, $request);

        self::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());
        $updatedReview = $repository->findById(1);
        self::assertNotNull($updatedReview);
        self::assertSame('2025-11-03T00:00:00+00:00', $updatedReview->createdAt?->format(DATE_ATOM));
    }

    public function testUpdateReturnsBadRequestForInvalidCreatedAt(): void
    {
        $controller = $this->controller();
        $request = Request::create(
            '/api/wines/2/reviews/1',
            'PUT',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'aroma' => 5,
                'appearance' => 2,
                'palate_entry' => 2,
                'body' => 4,
                'persistence' => 4,
                'bullets' => ['powerful'],
                'score' => 88,
                'created_at' => 'not-a-date',
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->update(2, 1, $request);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testUpdateReturnsForbiddenWhenOwnerMismatch(): void
    {
        $controller = $this->controller(authenticatedUserId: 99);
        $request = Request::create(
            '/api/wines/2/reviews/1',
            'PUT',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'aroma' => 5,
                'appearance' => 2,
                'palate_entry' => 2,
                'body' => 4,
                'persistence' => 4,
                'bullets' => ['powerful'],
                'score' => 88,
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->update(2, 1, $request);

        self::assertSame(Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }

    public function testDeleteReturnsNoContent(): void
    {
        $controller = $this->controller();

        $response = $controller->delete(2, 1);

        self::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());
    }

    public function testDeleteReturnsUnauthorizedWhenNoSession(): void
    {
        $controller = $this->controller(authenticatedUserId: null);

        $response = $controller->delete(2, 1);

        self::assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
    }

    public function testDeleteReturnsForbiddenWhenOwnerMismatch(): void
    {
        $controller = $this->controller(authenticatedUserId: 99);

        $response = $controller->delete(2, 1);

        self::assertSame(Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }

    private function controller(?int $authenticatedUserId = 1, bool $throwAlreadyExists = false): ReviewController
    {
        return $this->controllerWithRepository($authenticatedUserId, $throwAlreadyExists)[0];
    }

    /**
     * @return array{0:ReviewController,1:InMemoryWineReviewRepository}
     */
    private function controllerWithRepository(?int $authenticatedUserId = 1, bool $throwAlreadyExists = false): array
    {
        $repository = new InMemoryWineReviewRepository($throwAlreadyExists);
        $authSession = new SpyAuthSessionManager();
        $authSession->authenticatedUserId = $authenticatedUserId;

        return [new ReviewController(
            $authSession,
            new CreateReviewHandler($repository),
            new UpdateReviewHandler($repository),
            new DeleteReviewHandler($repository),
            new GetReviewHandler($repository),
        ), $repository];
    }
}

final class InMemoryWineReviewRepository implements WineReviewRepository
{
    /** @var array<int, WineReview> */
    private array $items = [];

    private int $nextId = 1;

    public function __construct(private readonly bool $throwAlreadyExists = false)
    {
        $this->items[1] = new WineReview(
            id: 1,
            userId: 1,
            wineId: 2,
            aroma: 4,
            appearance: 2,
            palateEntry: 3,
            body: 4,
            persistence: 4,
            bullets: [ReviewBullet::Floral],
            score: 88,
            createdAt: new \DateTimeImmutable('2026-03-01T10:00:00+00:00'),
        );
        $this->nextId = 2;
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
            aroma: $review->aroma,
            appearance: $review->appearance,
            palateEntry: $review->palateEntry,
            body: $review->body,
            persistence: $review->persistence,
            bullets: $review->bullets,
            score: $review->score,
            createdAt: $review->createdAt ?? new \DateTimeImmutable('2026-03-01T10:00:00+00:00'),
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

final class SpyAuthSessionManager implements AuthSessionManager
{
    public ?int $authenticatedUserId = null;

    public function loginByUserId(int $userId): void
    {
        $this->authenticatedUserId = $userId;
    }

    public function getAuthenticatedUserId(): ?int
    {
        return $this->authenticatedUserId;
    }

    public function logout(): void
    {
        $this->authenticatedUserId = null;
    }
}
