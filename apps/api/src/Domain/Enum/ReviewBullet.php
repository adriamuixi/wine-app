<?php

declare(strict_types=1);

namespace App\Domain\Enum;

enum ReviewBullet: string
{
    case Afrutado = 'fruity';
    case Floral = 'floral';
    case Especiado = 'spicy';
    case Mineral = 'mineral';
    case MaderaMarcada = 'oak_forward';
    case FacilDeBeber = 'easy_drinking';
    case Elegante = 'elegant';
    case Potente = 'powerful';
    case Gastronomico = 'food_friendly';
}
