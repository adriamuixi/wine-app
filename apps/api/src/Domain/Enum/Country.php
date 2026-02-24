<?php

declare(strict_types=1);

namespace App\Domain\Enum;

enum Country: string
{
    case Spain = 'spain';
    case France = 'france';
    case Italy = 'italy';
    case Portugal = 'portugal';
    case Germany = 'germany';
    case Argentina = 'argentina';
    case Chile = 'chile';
    case UnitedStates = 'united_states';
    case SouthAfrica = 'south_africa';
    case Australia = 'australia';
}
