<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Doctrine\Entity;

use App\Domain\Enum\Country;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: '"do"')]
#[ORM\UniqueConstraint(name: 'uniq_do_country_name', columns: ['country', 'name'])]
class DoRecord
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
}
