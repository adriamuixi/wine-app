<?php

declare(strict_types=1);

namespace App\Domain\Model;

final readonly class WinePurchase
{
    public function __construct(
        public Place $place,
        public string $pricePaid,
        public \DateTimeImmutable $purchasedAt,
        public ?int $id = null,
    ) {
        if (null !== $this->id && $this->id < 1) {
            throw new \InvalidArgumentException('purchase id must be >= 1.');
        }

        if (!is_numeric($this->pricePaid)) {
            throw new \InvalidArgumentException('purchases.price_paid must be >= 0.');
        }

        if ((float) $this->pricePaid < 0) {
            throw new \InvalidArgumentException('purchases.price_paid must be >= 0.');
        }
    }

    public function pricePaidAsFloat(): float
    {
        return (float) $this->pricePaid;
    }
}
