<?php

declare(strict_types=1);

namespace App\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOrigin;

use App\Domain\Enum\Country;

final readonly class CreateDesignationOfOriginCommand
{
    public function __construct(
        public string $name,
        public string $region,
        public Country $country,
        public string $countryCode,
        public ?string $doLogo,
        /** @var array{lat: float, lng: float, zoom?: int|null}|null */
        public ?array $mapData = null,
    ) {
    }
}
