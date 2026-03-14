<?php

declare(strict_types=1);

namespace App\Application\UseCases\DesignationOfOrigin\UpdateDesignationOfOrigin;

use App\Domain\Enum\Country;

final readonly class UpdateDesignationOfOriginCommand
{
    /**
     * @param array<string,bool> $provided
     */
    public function __construct(
        public int $doId,
        public ?string $name,
        public ?string $region,
        public ?Country $country,
        public ?string $countryCode,
        public ?string $doLogo,
        public ?string $regionLogo,
        public array $provided,
        /** @var array{lat: float, lng: float, zoom?: int|null}|null */
        public ?array $mapData = null,
    ) {
    }

    public function isProvided(string $field): bool
    {
        return ($this->provided[$field] ?? false) === true;
    }
}
