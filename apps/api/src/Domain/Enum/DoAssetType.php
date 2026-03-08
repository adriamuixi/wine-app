<?php

declare(strict_types=1);

namespace App\Domain\Enum;

enum DoAssetType: string
{
    case DoLogo = 'do_logo';
    case RegionLogo = 'region_logo';
}
