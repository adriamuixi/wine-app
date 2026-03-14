<?php

declare(strict_types=1);

namespace App\Application\UseCases\Review\CreateReview;

use App\Domain\Enum\ReviewBullet;

final readonly class CreateReviewCommand
{
    /**
     * @param list<ReviewBullet> $bullets
     */
    public function __construct(
        public int $userId,
        public int $wineId,
        public int $aroma,
        public int $appearance,
        public int $palateEntry,
        public int $body,
        public int $persistence,
        public array $bullets = [],
        public ?int $score = null,
        public ?\DateTimeImmutable $createdAt = null,
    ) {
    }
}
