<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\GetWine;

final readonly class WinePurchaseView
{
    public function __construct(
        public int $id,
        public WinePurchasePlaceView $place,
        public float $pricePaid,
        public string $purchasedAt,
    ) {
    }
}
