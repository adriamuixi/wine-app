<?php

declare(strict_types=1);

namespace App\Application\UseCases\Review\UpdateReview;

use App\Domain\Enum\ReviewBullet;

final readonly class UpdateReviewCommand
{
    /**
     * @param list<ReviewBullet> $bullets
     */
    public function __construct(
        public int $id,
        public int $intensityAroma,
        public int $sweetness,
        public int $acidity,
        public ?int $tannin,
        public int $body,
        public int $persistence,
        public array $bullets = [],
        public ?int $score = null,
    ) {
    }
}
