<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\ListWines;

final readonly class WineListItemReviewView
{
    public function __construct(
        public int $userId,
        public string $name,
        public string $lastname,
        public string $createdAt,
        public ?int $score,
    ) {
    }
}
