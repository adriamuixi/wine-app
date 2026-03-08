<?php

declare(strict_types=1);

namespace App\Application\UseCases\Do\UpdateDo;

use App\Domain\Enum\Country;

final readonly class UpdateDoCommand
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
    ) {
    }

    public function isProvided(string $field): bool
    {
        return ($this->provided[$field] ?? false) === true;
    }
}
