<?php

declare(strict_types=1);

namespace App\Adapters\In\Http;

use App\Application\Ports\AuthSessionManager;
use App\Application\UseCases\Review\CreateReview\CreateReviewAlreadyExists;
use App\Application\UseCases\Review\CreateReview\CreateReviewCommand;
use App\Application\UseCases\Review\CreateReview\CreateReviewHandler;
use App\Application\UseCases\Review\CreateReview\CreateReviewValidationException;
use App\Application\UseCases\Review\DeleteReview\DeleteReviewHandler;
use App\Application\UseCases\Review\DeleteReview\DeleteReviewNotFound;
use App\Application\UseCases\Review\GetReview\GetReviewHandler;
use App\Application\UseCases\Review\UpdateReview\UpdateReviewCommand;
use App\Application\UseCases\Review\UpdateReview\UpdateReviewHandler;
use App\Application\UseCases\Review\UpdateReview\UpdateReviewNotFound;
use App\Application\UseCases\Review\UpdateReview\UpdateReviewValidationException;
use App\Domain\Enum\ReviewBullet;
use App\Domain\Model\WineReview;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class ReviewController
{
    public function __construct(
        private readonly AuthSessionManager $authSession,
        private readonly CreateReviewHandler $createReviewHandler,
        private readonly UpdateReviewHandler $updateReviewHandler,
        private readonly DeleteReviewHandler $deleteReviewHandler,
        private readonly GetReviewHandler $getReviewHandler,
    ) {
    }

    #[Route('/api/wines/{wineId}/reviews/{id}', name: 'api_wine_reviews_get', methods: ['GET'])]
    public function getById(int $wineId, int $id): JsonResponse
    {
        $review = $this->getReviewHandler->handle($id);
        if (null === $review || $review->wineId !== $wineId) {
            return new JsonResponse(['error' => sprintf('Review %d not found.', $id)], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse(['review' => $this->reviewPayload($review)], Response::HTTP_OK);
    }

    #[Route('/api/wines/{wineId}/reviews', name: 'api_wine_reviews_create', methods: ['POST'])]
    public function create(int $wineId, Request $request): JsonResponse
    {
        $userId = $this->authSession->getAuthenticatedUserId();
        if (null === $userId) {
            return new JsonResponse(['error' => 'Unauthenticated.'], Response::HTTP_UNAUTHORIZED);
        }

        $payload = json_decode($request->getContent(), true);
        if (!is_array($payload)) {
            return new JsonResponse(['error' => 'Invalid JSON body.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $command = $this->buildCreateCommand($userId, $wineId, $payload);
            $result = $this->createReviewHandler->handle($command);
        } catch (CreateReviewValidationException $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (CreateReviewAlreadyExists $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_CONFLICT);
        }

        return new JsonResponse(['review' => ['id' => $result->id]], Response::HTTP_CREATED);
    }

    #[Route('/api/wines/{wineId}/reviews/{id}', name: 'api_wine_reviews_update', methods: ['PUT'])]
    public function update(int $wineId, int $id, Request $request): JsonResponse
    {
        $userId = $this->authSession->getAuthenticatedUserId();
        if (null === $userId) {
            return new JsonResponse(['error' => 'Unauthenticated.'], Response::HTTP_UNAUTHORIZED);
        }

        $existingReview = $this->getReviewHandler->handle($id);
        if (null === $existingReview || $existingReview->wineId !== $wineId) {
            return new JsonResponse(['error' => sprintf('Review %d not found.', $id)], Response::HTTP_NOT_FOUND);
        }
        if ($existingReview->userId !== $userId) {
            return new JsonResponse(['error' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $payload = json_decode($request->getContent(), true);
        if (!is_array($payload)) {
            return new JsonResponse(['error' => 'Invalid JSON body.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $command = $this->buildUpdateCommand($id, $payload);
            $this->updateReviewHandler->handle($command);
        } catch (UpdateReviewValidationException $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (UpdateReviewNotFound $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/api/wines/{wineId}/reviews/{id}', name: 'api_wine_reviews_delete', methods: ['DELETE'])]
    public function delete(int $wineId, int $id): JsonResponse
    {
        $userId = $this->authSession->getAuthenticatedUserId();
        if (null === $userId) {
            return new JsonResponse(['error' => 'Unauthenticated.'], Response::HTTP_UNAUTHORIZED);
        }

        $existingReview = $this->getReviewHandler->handle($id);
        if (null === $existingReview || $existingReview->wineId !== $wineId) {
            return new JsonResponse(['error' => sprintf('Review %d not found.', $id)], Response::HTTP_NOT_FOUND);
        }
        if ($existingReview->userId !== $userId) {
            return new JsonResponse(['error' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        try {
            $this->deleteReviewHandler->handle($id);
        } catch (DeleteReviewNotFound $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * @param array<string,mixed> $payload
     */
    private function buildCreateCommand(int $authenticatedUserId, int $wineId, array $payload): CreateReviewCommand
    {
        try {
            return new CreateReviewCommand(
                userId: $authenticatedUserId,
                wineId: $wineId,
                intensityAroma: $this->parseRequiredInt($payload['intensity_aroma'] ?? null, 'intensity_aroma'),
                sweetness: $this->parseRequiredInt($payload['sweetness'] ?? null, 'sweetness'),
                acidity: $this->parseRequiredInt($payload['acidity'] ?? null, 'acidity'),
                tannin: $this->parseNullableInt($payload['tannin'] ?? null, 'tannin'),
                body: $this->parseRequiredInt($payload['body'] ?? null, 'body'),
                persistence: $this->parseRequiredInt($payload['persistence'] ?? null, 'persistence'),
                bullets: $this->parseBullets($payload['bullets'] ?? []),
                score: $this->parseNullableInt($payload['score'] ?? null, 'score'),
            );
        } catch (\InvalidArgumentException $exception) {
            throw new CreateReviewValidationException($exception->getMessage(), 0, $exception);
        }
    }

    /**
     * @param array<string,mixed> $payload
     */
    private function buildUpdateCommand(int $id, array $payload): UpdateReviewCommand
    {
        try {
            return new UpdateReviewCommand(
                id: $id,
                intensityAroma: $this->parseRequiredInt($payload['intensity_aroma'] ?? null, 'intensity_aroma'),
                sweetness: $this->parseRequiredInt($payload['sweetness'] ?? null, 'sweetness'),
                acidity: $this->parseRequiredInt($payload['acidity'] ?? null, 'acidity'),
                tannin: $this->parseNullableInt($payload['tannin'] ?? null, 'tannin'),
                body: $this->parseRequiredInt($payload['body'] ?? null, 'body'),
                persistence: $this->parseRequiredInt($payload['persistence'] ?? null, 'persistence'),
                bullets: $this->parseBullets($payload['bullets'] ?? []),
                score: $this->parseNullableInt($payload['score'] ?? null, 'score'),
            );
        } catch (\InvalidArgumentException $exception) {
            throw new UpdateReviewValidationException($exception->getMessage(), 0, $exception);
        }
    }

    /**
     * @param mixed $value
     */
    private function parseRequiredInt(mixed $value, string $field): int
    {
        if (!is_int($value)) {
            throw new \InvalidArgumentException(sprintf('%s must be an integer.', $field));
        }

        return $value;
    }

    /**
     * @param mixed $value
     */
    private function parseNullableInt(mixed $value, string $field): ?int
    {
        if (null === $value) {
            return null;
        }

        if (!is_int($value)) {
            throw new \InvalidArgumentException(sprintf('%s must be an integer or null.', $field));
        }

        return $value;
    }

    /**
     * @param mixed $value
     * @return list<ReviewBullet>
     */
    private function parseBullets(mixed $value): array
    {
        if (!is_array($value)) {
            throw new \InvalidArgumentException('bullets must be an array.');
        }

        $bullets = [];
        foreach ($value as $bullet) {
            if (!is_string($bullet)) {
                throw new \InvalidArgumentException('Each bullet must be a string.');
            }

            try {
                $bullets[] = ReviewBullet::from($bullet);
            } catch (\ValueError) {
                throw new \InvalidArgumentException(sprintf('Invalid bullet "%s".', $bullet));
            }
        }

        return $bullets;
    }

    /**
     * @return array{
     *   id:int,
     *   user_id:int,
     *   wine_id:int,
     *   score:int|null,
     *   intensity_aroma:int,
     *   sweetness:int,
     *   acidity:int,
     *   tannin:int|null,
     *   body:int,
     *   persistence:int,
     *   bullets:list<string>,
     *   created_at:string|null
     * }
     */
    private function reviewPayload(WineReview $review): array
    {
        return [
            'id' => (int) $review->id,
            'user_id' => $review->userId,
            'wine_id' => $review->wineId,
            'score' => $review->score,
            'intensity_aroma' => $review->intensityAroma,
            'sweetness' => $review->sweetness,
            'acidity' => $review->acidity,
            'tannin' => $review->tannin,
            'body' => $review->body,
            'persistence' => $review->persistence,
            'bullets' => $review->bulletsAsValues(),
            'created_at' => $review->createdAt?->format(DATE_ATOM),
        ];
    }
}
