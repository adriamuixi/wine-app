<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Doctrine\Entity;

use App\Domain\Enum\WinePhotoType;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'wine_photo')]
class PhotoRecord
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'bigint')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: WineRecord::class)]
    #[ORM\JoinColumn(name: 'wine_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    private WineRecord $wine;

    #[ORM\Column(type: Types::TEXT)]
    private string $url;

    #[ORM\Column(enumType: WinePhotoType::class, nullable: true)]
    private ?WinePhotoType $type = null;

    #[ORM\Column(length: 16)]
    private string $hash;

    #[ORM\Column(type: 'bigint')]
    private int $size;

    #[ORM\Column(length: 10)]
    private string $extension;
}
