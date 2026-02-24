<?php

declare(strict_types=1);

namespace App\Domain\Enum;

enum PlaceType: string
{
    case Supermarket = 'supermarket';
    case Restaurant = 'restaurant';
}
