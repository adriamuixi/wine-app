<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\ListWines;

use App\Domain\Enum\Country;
use App\Domain\Enum\WineType;

final readonly class ListWinesQuery
{
    public function __construct(
        public int $page,
        public int $limit,
        public ?string $search,
        public ?WineType $wineType,
        public ?Country $country,
        public ?int $doId,
        public ?int $grapeId,
        public ?int $scoreMin,
        public ?int $scoreMax,
        public string $sortBy,
        public string $sortDir,
    ) {
    }
}
