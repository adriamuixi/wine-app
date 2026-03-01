<?php

declare(strict_types=1);

namespace App\Application\UseCases\Review\DeleteReview;

use App\Domain\Repository\WineReviewRepository;

final readonly class DeleteReviewHandler
{
    public function __construct(private WineReviewRepository $reviews)
    {
    }

    public function handle(int $id): void
    {
        if (null === $this->reviews->findById($id)) {
            throw new DeleteReviewNotFound(sprintf('Review %d not found.', $id));
        }

        $this->reviews->deleteById($id);
    }
}
