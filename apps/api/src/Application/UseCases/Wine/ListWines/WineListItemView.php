<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\ListWines;

final readonly class WineListItemView
{
    /**
     * @param list<WineListItemGrapeView> $grapes
     * @param list<WineListItemAwardView> $awards
     * @param list<WineListItemPhotoView> $photos
     */
    public function __construct(
        public int $id,
        public string $name,
        public ?string $winery,
        public ?string $wineType,
        public ?string $agingType,
        public ?string $country,
        public ?int $doId,
        public ?string $doName,
        public ?string $doLogoImage,
        public ?int $vintageYear,
        public ?float $avgScore,
        public string $updatedAt,
        public array $grapes = [],
        public array $awards = [],
        public array $photos = [],
    ) {
    }
}
