<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\ListWines;

final readonly class WineListItemView
{
    public function __construct(
        public int $id,
        public string $name,
        public ?string $winery,
        public ?string $wineType,
        public ?string $country,
        public ?int $doId,
        public ?string $doName,
        public ?int $vintageYear,
        public ?float $avgScore,
        public string $updatedAt,
    ) {
    }
}
