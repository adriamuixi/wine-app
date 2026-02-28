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
#[ORM\Index(name: 'wine_name_vintage_idx', columns: ['name', 'vintage_year'])]
#[ORM\Index(name: 'wine_country_do_idx', columns: ['country', 'do_id'])]
class WineRecord
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'bigint')]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $name;

    #[ORM\Column(name: 'wine_type', enumType: WineType::class)]
    private WineType $wineType;

    #[ORM\ManyToOne(targetEntity: DoRecord::class)]
    #[ORM\JoinColumn(name: 'do_id', referencedColumnName: 'id', nullable: false)]
    private DoRecord $do;

    #[ORM\Column(enumType: Country::class)]
    private Country $country;

    #[ORM\Column(name: 'aging_type', enumType: AgingType::class, nullable: true)]
    private ?AgingType $agingType = null;

    #[ORM\Column(name: 'vintage_year', type: Types::INTEGER, nullable: true)]
    private ?int $vintageYear = null;

    #[ORM\Column(name: 'alcohol_percentage', type: Types::INTEGER, nullable: true)]
    private ?int $alcoholPercentage = null;

    #[ORM\Column(name: 'created_at', type: 'app_timestamptz_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(name: 'updated_at', type: 'app_timestamptz_immutable')]
    private \DateTimeImmutable $updatedAt;
}
