<?php

declare(strict_types=1);

namespace App\Application\Ports;

use App\Domain\Enum\DoAssetType;

interface DoAssetStoragePort
{
    public function save(string $sourcePath, int $doId, DoAssetType $type, string $originalFilename, string $doName, string $regionName): string;
}
