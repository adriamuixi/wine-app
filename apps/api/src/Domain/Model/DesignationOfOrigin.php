<?php

declare(strict_types=1);

namespace App\Domain\Model;

use App\Domain\Enum\Country;

final readonly class DesignationOfOrigin
{
    /** @var array{lat: float, lng: float, zoom?: int|null}|null */
    public function __construct(
        public int $id,
        public string $name,
        public string $region,
        public Country $country,
        public string $countryCode,
        public ?string $doLogo = null,
        public ?string $regionLogo = null,
        public ?array $mapData = null,
    ) {
        if ($this->id < 1) {
            throw new \InvalidArgumentException('do id must be >= 1.');
        }

        if ('' === trim($this->name)) {
            throw new \InvalidArgumentException('do name is required.');
        }

        if ('' === trim($this->region)) {
            throw new \InvalidArgumentException('do region is required.');
        }

        if (2 !== strlen($this->countryCode)) {
            throw new \InvalidArgumentException('do country code must have 2 characters.');
        }

        if (null !== $this->doLogo && '' === trim($this->doLogo)) {
            throw new \InvalidArgumentException('do logo cannot be blank when provided.');
        }

        if (null !== $this->regionLogo && '' === trim($this->regionLogo)) {
            throw new \InvalidArgumentException('do region logo cannot be blank when provided.');
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
            throw new \InvalidArgumentException('map_data.lat must be numeric.');
        }

        if (!array_key_exists('lng', $mapData) || !is_numeric($mapData['lng'])) {
            throw new \InvalidArgumentException('map_data.lng must be numeric.');
        }

        $lat = (float) $mapData['lat'];
        $lng = (float) $mapData['lng'];

        if ($lat < -90 || $lat > 90) {
            throw new \InvalidArgumentException('map_data.lat must be between -90 and 90.');
        }

        if ($lng < -180 || $lng > 180) {
            throw new \InvalidArgumentException('map_data.lng must be between -180 and 180.');
        }

        if (array_key_exists('zoom', $mapData) && null !== $mapData['zoom']) {
            if (!is_int($mapData['zoom'])) {
                throw new \InvalidArgumentException('map_data.zoom must be an integer when provided.');
            }

            if ($mapData['zoom'] < 1 || $mapData['zoom'] > 18) {
                throw new \InvalidArgumentException('map_data.zoom must be between 1 and 18 when provided.');
            }
        }

        if (!array_key_exists('zoom', $mapData)) {
            return;
        }
    }
}
