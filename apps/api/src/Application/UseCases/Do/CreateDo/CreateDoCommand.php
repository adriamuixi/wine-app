<?php

declare(strict_types=1);

namespace App\Application\UseCases\Do\CreateDo;

use App\Domain\Enum\Country;

final readonly class CreateDoCommand
{
    public function __construct(
        public string $name,
        public string $region,
        public Country $country,
        public string $countryCode,
        public ?string $doLogo,
    ) {
    }
}
