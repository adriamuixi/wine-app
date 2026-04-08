<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\ListWineRoute;

final readonly class WineRouteStopView
{
    public function __construct(
        public int $purchaseId,
        public string $purchasedAt,
        public float $pricePaid,
        public int $wineId,
        public string $wineName,
        public ?string $winery,
        public ?string $wineType,
        public ?string $country,
        public ?int $doId,
        public ?string $doName,
        public ?string $doLogo,
        public ?string $regionLogo,
        public int $placeId,
        public string $placeName,
        public ?string $placeAddress,
        public ?string $placeCity,
        public string $placeCountry,
        public float $lat,
        public float $lng,
    ) {
    }
}
