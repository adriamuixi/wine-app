<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\ListWines;

final readonly class WineListItemAwardView
{
    public function __construct(
        public string $name,
        public ?float $score,
        public ?int $year,
        public ?string $value = null,
    ) {
    }
}
