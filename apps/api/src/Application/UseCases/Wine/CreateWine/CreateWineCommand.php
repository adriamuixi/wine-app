<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\CreateWine;

use App\Domain\Enum\AgingType;
use App\Domain\Enum\Country;
use App\Domain\Enum\WineType;

/**
 * @phpstan-type GrapeInput list<CreateWineGrapeInput>
 * @phpstan-type PurchaseInput list<CreateWinePurchaseInput>
 * @phpstan-type AwardInput list<CreateWineAwardInput>
 */
final readonly class CreateWineCommand
{
    /**
     * @param GrapeInput $grapes
     * @param PurchaseInput $purchases
     * @param AwardInput $awards
     */
    public function __construct(
        public string $name,
        public ?string $winery,
        public ?WineType $wineType,
        public ?int $doId,
        public ?Country $country,
        public ?AgingType $agingType,
        public ?int $vintageYear,
        public ?float $alcoholPercentage,
        public array $grapes,
        public array $purchases,
        public array $awards,
    ) {
    }
}
