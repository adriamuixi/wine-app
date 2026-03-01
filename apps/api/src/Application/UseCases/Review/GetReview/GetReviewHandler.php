<?php

declare(strict_types=1);

namespace App\Application\UseCases\Review\GetReview;

use App\Domain\Model\WineReview;
use App\Domain\Repository\WineReviewRepository;

final readonly class GetReviewHandler
{
    public function __construct(private WineReviewRepository $reviews)
    {
    }

    public function handle(int $id): ?WineReview
    {
        return $this->reviews->findById($id);
    }
}
