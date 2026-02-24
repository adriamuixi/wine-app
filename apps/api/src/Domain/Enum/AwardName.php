<?php

declare(strict_types=1);

namespace App\Domain\Enum;

enum AwardName: string
{
    case Penin = 'penin';
    case Parker = 'parker';
    case WineSpectator = 'wine_spectator';
    case Decanter = 'decanter';
    case JamesSuckling = 'james_suckling';
    case GuiaProensa = 'guia_proensa';
}
