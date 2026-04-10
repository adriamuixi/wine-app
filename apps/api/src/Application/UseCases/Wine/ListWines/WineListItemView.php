<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\ListWines;

final readonly class WineListItemView
{
    /**
     * @param list<WineListItemGrapeView> $grapes
     * @param list<WineListItemAwardView> $awards
     * @param list<WineListItemPhotoView> $photos
     * @param list<WineListItemReviewView> $reviews
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
        public ?string $doLogo,
        public ?string $regionLogo,
        public ?int $vintageYear,
        public ?float $avgScore,
        public ?float $pricePaid,
        public ?string $purchasedAt,
        public string $updatedAt,
        public array $grapes = [],
        public array $awards = [],
        public array $photos = [],
        public array $reviews = [],
    ) {
    }
}
