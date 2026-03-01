<?php

declare(strict_types=1);

namespace App\Application\UseCases\Review\CreateReview;

final readonly class CreateReviewResult
{
    public function __construct(public int $id)
    {
    }
}
