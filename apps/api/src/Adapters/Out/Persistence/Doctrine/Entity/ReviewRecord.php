<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Doctrine\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'review')]
#[ORM\UniqueConstraint(name: 'uniq_review_user_wine', columns: ['user_id', 'wine_id'])]
class ReviewRecord
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'bigint')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: UserRecord::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    private UserRecord $user;

    #[ORM\ManyToOne(targetEntity: WineRecord::class)]
    #[ORM\JoinColumn(name: 'wine_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    private WineRecord $wine;

    #[ORM\Column(type: Types::INTEGER, nullable: true)]
    private ?int $score = null;

    #[ORM\Column(name: 'aroma', type: Types::SMALLINT)]
    private int $aroma;

    #[ORM\Column(type: Types::SMALLINT)]
    private int $appearance;

    #[ORM\Column(name: 'palate_entry', type: Types::SMALLINT)]
    private int $palateEntry;

    #[ORM\Column(name: 'body', type: Types::SMALLINT)]
    private int $body;

    #[ORM\Column(type: Types::SMALLINT)]
    private int $persistence;

    #[ORM\Column(name: 'created_at', type: 'app_timestamptz_immutable')]
    private \DateTimeImmutable $createdAt;
}
