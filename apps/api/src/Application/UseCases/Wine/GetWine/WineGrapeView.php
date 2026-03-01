<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\GetWine;

final readonly class WineGrapeView
{
    public function __construct(
        public int $id,
        public string $name,
        public string $color,
        public ?float $percentage,
    ) {
    }
}
