<?php

declare(strict_types=1);

namespace App\Application\UseCases\Review\ListReviews;

final readonly class ListReviewsQuery
{
    public function __construct(
        public int $page,
        public int $limit,
        public string $sortBy,
        public string $sortDir,
        public ?int $userId = null,
    ) {
    }
}
