<?php

declare(strict_types=1);

namespace App\Application\UseCases\Review\ListReviews;

final readonly class ReviewListItemView
{
    /**
     * @param list<string> $bullets
     */
    public function __construct(
        public int $id,
        public int $userId,
        public string $userName,
        public string $userLastname,
        public int $wineId,
        public string $wineName,
        public ?int $doId,
        public ?string $doName,
        public ?int $score,
        public int $aroma,
        public int $appearance,
        public int $palateEntry,
        public int $body,
        public int $persistence,
        public array $bullets,
        public string $createdAt,
    ) {
    }
}
