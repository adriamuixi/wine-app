<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\CreateWine;

final readonly class CreateWinePurchaseInput
{
    public function __construct(
        public CreateWinePlaceInput $place,
        public string $pricePaid,
        public \DateTimeImmutable $purchasedAt,
    ) {
    }
}
