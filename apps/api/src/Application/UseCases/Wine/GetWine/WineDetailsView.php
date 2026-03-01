<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\GetWine;

final readonly class WineDetailsView
{
    /**
     * @param list<WineGrapeView> $grapes
     * @param list<WinePurchaseView> $purchases
     * @param list<WineAwardView> $awards
     * @param list<WinePhotoView> $photos
     * @param list<WineReviewView> $reviews
     */
    public function __construct(
        public int $id,
        public string $name,
        public ?string $winery,
        public ?string $wineType,
        public ?WineDoView $do,
        public ?string $country,
        public ?string $agingType,
        public ?int $vintageYear,
        public ?float $alcoholPercentage,
        public string $createdAt,
        public string $updatedAt,
        public array $grapes,
        public array $purchases,
        public array $awards,
        public array $photos,
        public array $reviews,
    ) {
    }
}
