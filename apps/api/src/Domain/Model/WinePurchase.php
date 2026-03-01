<?php

declare(strict_types=1);

namespace App\Domain\Model;

final readonly class WinePurchase
{
    public function __construct(
        public Place $place,
        public string $pricePaid,
        public \DateTimeImmutable $purchasedAt,
    ) {
        if (!is_numeric($this->pricePaid)) {
            throw new \InvalidArgumentException('purchases.price_paid must be >= 0.');
        }

        if ((float) $this->pricePaid < 0) {
            throw new \InvalidArgumentException('purchases.price_paid must be >= 0.');
        }
    }
}
