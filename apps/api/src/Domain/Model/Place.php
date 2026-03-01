<?php

declare(strict_types=1);

namespace App\Domain\Model;

use App\Domain\Enum\Country;
use App\Domain\Enum\PlaceType;

final readonly class Place
{
    public function __construct(
        public PlaceType $placeType,
        public string $name,
        public ?string $address,
        public ?string $city,
        public Country $country,
        public ?int $id = null,
    ) {
        if (null !== $this->id && $this->id < 1) {
            throw new \InvalidArgumentException('place id must be >= 1.');
        }

        if ('' === trim($this->name)) {
            throw new \InvalidArgumentException('purchases.place.name is required.');
        }

        if (PlaceType::Restaurant === $this->placeType) {
            if (null === $this->address || '' === trim($this->address)) {
                throw new \InvalidArgumentException('purchases.place.address is required for restaurant.');
            }

            if (null === $this->city || '' === trim($this->city)) {
                throw new \InvalidArgumentException('purchases.place.city is required for restaurant.');
            }
        }

        if (PlaceType::Supermarket === $this->placeType && null !== $this->address) {
            throw new \InvalidArgumentException('purchases.place.address must be null for supermarket.');
        }
    }
}
