<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\GetWine;

final readonly class WineReviewUserView
{
    public function __construct(
        public int $id,
        public string $name,
        public string $lastname,
    ) {
    }
}
