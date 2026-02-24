<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Doctrine\Entity;

use App\Domain\Enum\ReviewBullet;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'review_bullets')]
class ReviewBulletRecord
{
    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: ReviewRecord::class)]
    #[ORM\JoinColumn(name: 'review_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    private ReviewRecord $review;

    #[ORM\Id]
    #[ORM\Column(enumType: ReviewBullet::class)]
    private ReviewBullet $bullet;
}
