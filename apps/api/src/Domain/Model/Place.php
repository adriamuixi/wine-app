<?php

declare(strict_types=1);

namespace App\Domain\Model;

use App\Domain\Enum\Country;
use App\Domain\Enum\PlaceType;

final readonly class Place
{
    /** @var array{lat: float, lng: float}|null */
    public function __construct(
        public PlaceType $placeType,
        public string $name,
        public ?string $address,
        public ?string $city,
        public Country $country,
        public ?int $id = null,
        public ?array $mapData = null,
    ) {
        if (null !== $this->id && $this->id < 1) {
            throw new \InvalidArgumentException('place id must be >= 1.');
        }

        if ('' === trim($this->name)) {
            throw new \InvalidArgumentException('purchases.place.name is required.');
        }

        if (null !== $this->address && '' === trim($this->address)) {
            throw new \InvalidArgumentException('purchases.place.address cannot be blank when provided.');
        }

        if (null !== $this->city && '' === trim($this->city)) {
            throw new \InvalidArgumentException('purchases.place.city cannot be blank when provided.');
        }

        if (null !== $this->mapData) {
            $this->assertValidMapData($this->mapData);
        }
    }

    /**
     * @param array<string,mixed> $mapData
     */
    private function assertValidMapData(array $mapData): void
    {
        if (!array_key_exists('lat', $mapData) || !is_numeric($mapData['lat'])) {
            throw new \InvalidArgumentException('purchases.place.map_data.lat must be numeric.');
        }

        if (!array_key_exists('lng', $mapData) || !is_numeric($mapData['lng'])) {
            throw new \InvalidArgumentException('purchases.place.map_data.lng must be numeric.');
        }

        $lat = (float) $mapData['lat'];
        $lng = (float) $mapData['lng'];

        if ($lat < -90 || $lat > 90) {
            throw new \InvalidArgumentException('purchases.place.map_data.lat must be between -90 and 90.');
        }

        if ($lng < -180 || $lng > 180) {
            throw new \InvalidArgumentException('purchases.place.map_data.lng must be between -180 and 180.');
        }
    }
}
