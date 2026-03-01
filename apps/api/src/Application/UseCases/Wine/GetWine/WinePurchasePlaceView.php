<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\GetWine;

final readonly class WinePurchasePlaceView
{
    public function __construct(
        public int $id,
        public string $placeType,
        public string $name,
        public ?string $address,
        public ?string $city,
        public string $country,
    ) {
    }
}
