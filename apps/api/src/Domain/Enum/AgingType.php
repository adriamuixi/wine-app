<?php

declare(strict_types=1);

namespace App\Domain\Enum;

enum AgingType: string
{
    case Young = 'young';
    case Crianza = 'crianza';
    case Reserve = 'reserve';
    case GrandReserve = 'grand_reserve';
}
