<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Doctrine\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'wine_grape')]
class WineGrapeRecord
{
    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: WineRecord::class)]
    #[ORM\JoinColumn(name: 'wine_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    private WineRecord $wine;

    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: GrapeRecord::class)]
    #[ORM\JoinColumn(name: 'grape_id', referencedColumnName: 'id', nullable: false)]
    private GrapeRecord $grape;

    #[ORM\Column(type: Types::DECIMAL, precision: 5, scale: 2, nullable: true)]
    private ?string $percentage = null;
}
