<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Doctrine\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'wine_purchase')]
#[ORM\Index(name: 'wine_purchase_wine_purchased_at_idx', columns: ['wine_id', 'purchased_at'])]
class WinePurchaseRecord
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'bigint')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: WineRecord::class)]
    #[ORM\JoinColumn(name: 'wine_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    private WineRecord $wine;

    #[ORM\ManyToOne(targetEntity: PlaceRecord::class)]
    #[ORM\JoinColumn(name: 'place_id', referencedColumnName: 'id', nullable: false)]
    private PlaceRecord $place;

    #[ORM\Column(name: 'price_paid', type: Types::DECIMAL, precision: 10, scale: 2)]
    private string $pricePaid;

    #[ORM\Column(name: 'purchased_at', type: 'app_timestamptz_immutable')]
    private \DateTimeImmutable $purchasedAt;

    #[ORM\Column(name: 'created_at', type: 'app_timestamptz_immutable')]
    private \DateTimeImmutable $createdAt;
}
