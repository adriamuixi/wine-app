<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\UpdateWine;

use App\Domain\Enum\AgingType;
use App\Domain\Enum\Country;
use App\Domain\Enum\WineType;

final readonly class UpdateWineCommand
{
    /**
     * @param array<string,bool> $provided
     */
    public function __construct(
        public int $wineId,
        public ?string $name,
        public ?string $winery,
        public ?WineType $wineType,
        public ?int $doId,
        public ?Country $country,
        public ?AgingType $agingType,
        public ?int $vintageYear,
        public ?float $alcoholPercentage,
        public array $provided,
    ) {
    }

    public function isProvided(string $field): bool
    {
        return ($this->provided[$field] ?? false) === true;
    }
}
