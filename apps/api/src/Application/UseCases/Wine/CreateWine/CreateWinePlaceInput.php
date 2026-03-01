<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\CreateWine;

use App\Domain\Enum\Country;
use App\Domain\Enum\PlaceType;

final readonly class CreateWinePlaceInput
{
    public function __construct(
        public PlaceType $placeType,
        public string $name,
        public ?string $address,
        public ?string $city,
        public Country $country,
    ) {
    }
}
