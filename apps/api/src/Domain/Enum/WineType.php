<?php

declare(strict_types=1);

namespace App\Domain\Enum;

enum WineType: string
{
    case Red = 'red';
    case White = 'white';
    case Rose = 'rose';
    case Sparkling = 'sparkling';
    case Sweet = 'sweet';
    case Fortified = 'fortified';
}
