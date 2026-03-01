<?php

declare(strict_types=1);

namespace App\Domain\Model;

use App\Domain\Enum\AgingType;
use App\Domain\Enum\Country;
use App\Domain\Enum\WineType;

final readonly class Wine
{
    public string $name;
    public ?string $winery;

    public function __construct(
        string $name,
        ?string $winery,
        public ?WineType $wineType,
        public ?Country $country,
        public ?AgingType $agingType,
        public ?int $vintageYear,
        public ?float $alcoholPercentage,
    ) {
        $normalizedName = trim($name);
        if ('' === $normalizedName) {
            throw new \InvalidArgumentException('name is required.');
        }
        $this->name = $normalizedName;
        $this->winery = null === $winery ? null : trim($winery);

        self::assertVintageYear($this->vintageYear);
        self::assertAlcoholPercentage($this->alcoholPercentage);
    }

    public static function assertVintageYear(?int $vintageYear): void
    {
        if (null !== $vintageYear && ($vintageYear < 1800 || $vintageYear > 2200)) {
            throw new \InvalidArgumentException('vintage_year must be between 1800 and 2200.');
        }
    }

    public static function assertAlcoholPercentage(?float $alcoholPercentage): void
    {
        if (null !== $alcoholPercentage && ($alcoholPercentage < 0 || $alcoholPercentage > 100)) {
            throw new \InvalidArgumentException('alcohol_percentage must be between 0 and 100.');
        }
    }

    public function assertCountryMatchesDo(?DenominationOfOrigin $do): void
    {
        if (null === $do || null === $this->country) {
            return;
        }

        if ($this->country !== $do->country) {
            throw new \InvalidArgumentException('country must match do country when do_id is provided.');
        }
    }
}
