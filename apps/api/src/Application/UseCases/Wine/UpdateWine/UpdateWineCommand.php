<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\UpdateWine;

use App\Application\UseCases\Wine\CreateWine\CreateWineGrapeInput;
use App\Application\UseCases\Wine\CreateWine\CreateWineAwardInput;
use App\Domain\Enum\AgingType;
use App\Domain\Enum\Country;
use App\Domain\Enum\WineType;

final readonly class UpdateWineCommand
{
    /**
     * @param array<string,bool> $provided
     * @param list<CreateWineGrapeInput> $grapes
     * @param list<CreateWineAwardInput> $awards
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
        public array $grapes = [],
        public array $awards = [],
    ) {
    }

    public function isProvided(string $field): bool
    {
        return ($this->provided[$field] ?? false) === true;
    }
}
