<?php

declare(strict_types=1);

namespace App\Application\UseCases\Review\CreateReview;

use App\Domain\Model\WineReview;
use App\Domain\Repository\WineReviewRepository;

final readonly class CreateReviewHandler
{
    public function __construct(private WineReviewRepository $reviews)
    {
    }

    public function handle(CreateReviewCommand $command): CreateReviewResult
    {
        if ($this->reviews->existsByUserAndWine($command->userId, $command->wineId)) {
            throw new CreateReviewAlreadyExists('Review already exists for this user and wine.');
        }

        try {
            $review = new WineReview(
                userId: $command->userId,
                wineId: $command->wineId,
                intensityAroma: $command->intensityAroma,
                sweetness: $command->sweetness,
                acidity: $command->acidity,
                tannin: $command->tannin,
                body: $command->body,
                persistence: $command->persistence,
                bullets: $command->bullets,
                score: $command->score,
            );
        } catch (\InvalidArgumentException $exception) {
            throw new CreateReviewValidationException($exception->getMessage(), 0, $exception);
        }

        return new CreateReviewResult($this->reviews->create($review));
    }
}
