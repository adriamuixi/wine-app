<?php

declare(strict_types=1);

namespace App\Domain\Model;

use App\Domain\Enum\Country;

final readonly class DenominationOfOrigin
{
    public function __construct(
        public int $id,
        public string $name,
        public string $region,
        public Country $country,
        public string $countryCode,
        public ?string $doLogo = null,
        public ?string $regionLogo = null,
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
    }
}
