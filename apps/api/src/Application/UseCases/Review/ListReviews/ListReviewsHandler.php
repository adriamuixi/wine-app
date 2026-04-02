<?php

declare(strict_types=1);

namespace App\Application\UseCases\Review\ListReviews;

use App\Domain\Repository\WineReviewRepository;

final readonly class ListReviewsHandler
{
    private const SORTABLE_FIELDS = [
        ListReviewsSort::SCORE,
        ListReviewsSort::NAME,
        ListReviewsSort::DO,
    ];
    private const SORTABLE_DIRECTIONS = [ListReviewsSort::ASC, ListReviewsSort::DESC];

    public function __construct(private WineReviewRepository $reviews)
    {
    }

    public function handle(ListReviewsQuery $query): ListReviewsResult
    {
        if ($query->page < 1) {
            throw new ListReviewsValidationException('page must be >= 1.');
        }

        if ($query->limit < 1 || $query->limit > 100) {
            throw new ListReviewsValidationException('limit must be between 1 and 100.');
        }

        if (!in_array($query->sortBy, self::SORTABLE_FIELDS, true)) {
            throw new ListReviewsValidationException('Invalid sort_by value.');
        }

        if (!in_array($query->sortDir, self::SORTABLE_DIRECTIONS, true)) {
            throw new ListReviewsValidationException('Invalid sort_dir value.');
        }

        if (null !== $query->userId && $query->userId < 1) {
            throw new ListReviewsValidationException('user_id must be >= 1.');
        }

        return $this->reviews->findPaginated($query);
    }
}
