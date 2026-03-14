<?php

declare(strict_types=1);

namespace App\Domain\Enum;

enum ReviewBullet: string
{
    case Afrutado = 'fruity';
    case Floral = 'floral';
    case Mineral = 'mineral';
    case MaderaMarcada = 'oak_forward';
    case Potente = 'powerful';
}
