<?php

declare(strict_types=1);

namespace App\Domain\Enum;

enum ReviewBullet: string
{
    case Afrutado = 'afrutado';
    case Floral = 'floral';
    case Especiado = 'especiado';
    case Mineral = 'mineral';
    case MaderaMarcada = 'madera_marcada';
    case FacilDeBeber = 'facil_de_beber';
    case Elegante = 'elegante';
    case Potente = 'potente';
    case Gastronomico = 'gastronomico';
}
