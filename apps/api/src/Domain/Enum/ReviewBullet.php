<?php

declare(strict_types=1);

namespace App\Domain\Enum;

enum ReviewBullet: string
{
    case Fruity = 'fruity';
    case Floral = 'floral';
    case Spicy = 'spicy';
    case Mineral = 'mineral';
    case OakForward = 'oak_forward';
    case EasyDrinking = 'easy_drinking';
    case Elegant = 'elegant';
    case Powerful = 'powerful';
    case FoodFriendly = 'food_friendly';
}
