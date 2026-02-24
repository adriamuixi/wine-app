<?php

declare(strict_types=1);

namespace App\Domain\Enum;

enum PhotoType: string
{
    case FrontLabel = 'front_label';
    case BackLabel = 'back_label';
    case Bottle = 'bottle';
}
