<?php

declare(strict_types=1);

namespace App\Domain\Model;

final readonly class ReviewMonthStats
{
    public function __construct(
        public \DateTimeImmutable $month,
        public int $reviewCount,
        public ?float $medianScore,
    ) {
    }
}
