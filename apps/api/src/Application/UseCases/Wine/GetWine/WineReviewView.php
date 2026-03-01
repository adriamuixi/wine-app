<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\GetWine;

final readonly class WineReviewView
{
    /**
     * @param list<string> $bullets
     */
    public function __construct(
        public int $id,
        public WineReviewUserView $user,
        public ?int $score,
        public int $intensityAroma,
        public int $sweetness,
        public int $acidity,
        public ?int $tannin,
        public int $body,
        public int $persistence,
        public array $bullets,
        public string $createdAt,
    ) {
    }
}
