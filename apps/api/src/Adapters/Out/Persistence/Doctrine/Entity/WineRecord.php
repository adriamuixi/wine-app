<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Doctrine\Entity;

use App\Domain\Enum\AgingType;
use App\Domain\Enum\Country;
use App\Domain\Enum\WineType;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'wine')]
#[ORM\Index(name: 'wine_winery_name_vintage_idx', columns: ['winery', 'name', 'vintage_year'])]
#[ORM\Index(name: 'wine_country_region_idx', columns: ['country', 'region_do_id'])]
class WineRecord
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'bigint')]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $name;

    #[ORM\Column(length: 255)]
    private string $winery;

    #[ORM\Column(name: 'wine_type', enumType: WineType::class)]
    private WineType $wineType;

    #[ORM\ManyToOne(targetEntity: RegionDoRecord::class)]
    #[ORM\JoinColumn(name: 'region_do_id', referencedColumnName: 'id', nullable: false)]
    private RegionDoRecord $regionDo;

    #[ORM\Column(enumType: Country::class)]
    private Country $country;

    #[ORM\Column(name: 'aging_type', enumType: AgingType::class, nullable: true)]
    private ?AgingType $agingType = null;

    #[ORM\Column(name: 'vintage_year', type: Types::INTEGER, nullable: true)]
    private ?int $vintageYear = null;

    #[ORM\Column(name: 'alcohol_percentage', type: Types::INTEGER, nullable: true)]
    private ?int $alcoholPercentage = null;

    #[ORM\ManyToOne(targetEntity: PlaceRecord::class)]
    #[ORM\JoinColumn(name: 'purchase_place_id', referencedColumnName: 'id', nullable: false)]
    private PlaceRecord $purchasePlace;

    #[ORM\Column(name: 'price_paid', type: Types::DECIMAL, precision: 10, scale: 2)]
    private string $pricePaid;

    #[ORM\Column(name: 'created_at', type: 'app_timestamptz_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(name: 'updated_at', type: 'app_timestamptz_immutable')]
    private \DateTimeImmutable $updatedAt;
}
