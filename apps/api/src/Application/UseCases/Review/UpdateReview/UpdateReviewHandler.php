<?php

declare(strict_types=1);

namespace App\Application\UseCases\Review\UpdateReview;

use App\Domain\Model\WineReview;
use App\Domain\Repository\WineReviewRepository;

final readonly class UpdateReviewHandler
{
    public function __construct(private WineReviewRepository $reviews)
    {
    }

    public function handle(UpdateReviewCommand $command): void
    {
        $existing = $this->reviews->findById($command->id);
        if (null === $existing) {
            throw new UpdateReviewNotFound(sprintf('Review %d not found.', $command->id));
        }

        try {
            $updated = new WineReview(
                id: $existing->id,
                userId: $existing->userId,
                wineId: $existing->wineId,
                intensityAroma: $command->intensityAroma,
                sweetness: $command->sweetness,
                acidity: $command->acidity,
                tannin: $command->tannin,
                body: $command->body,
                persistence: $command->persistence,
                bullets: $command->bullets,
                score: $command->score ?? $existing->score,
                createdAt: $existing->createdAt,
                userName: $existing->userName,
                userLastname: $existing->userLastname,
            );
        } catch (\InvalidArgumentException $exception) {
            throw new UpdateReviewValidationException($exception->getMessage(), 0, $exception);
        }

        $this->reviews->update($updated);
    }
}
