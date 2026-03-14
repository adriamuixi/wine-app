<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Doctrine\Entity;

use App\Domain\Enum\Country;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'designation_of_origin')]
#[ORM\UniqueConstraint(name: 'uniq_designation_of_origin_country_name', columns: ['country', 'name'])]
class DesignationOfOriginRecord
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'bigint')]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $name;

    #[ORM\Column(length: 255)]
    private string $region;

    #[ORM\Column(enumType: Country::class)]
    private Country $country;

    #[ORM\Column(name: 'country_code', length: 2)]
    private string $countryCode;

    #[ORM\Column(name: 'do_logo', length: 255, nullable: true)]
    private ?string $doLogo = null;

    #[ORM\Column(name: 'region_logo', length: 255, nullable: true)]
    private ?string $regionLogo = null;

    /** @var array<string,mixed>|null */
    #[ORM\Column(name: 'map_data', type: 'json', nullable: true)]
    private ?array $mapData = null;
}
