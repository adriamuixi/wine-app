<?php

declare(strict_types=1);

namespace App\Application\UseCases\Do\CreateDoAsset;

use App\Domain\Enum\DoAssetType;

final readonly class CreateDoAssetCommand
{
    public function __construct(
        public int $doId,
        public DoAssetType $type,
        public string $sourcePath,
        public string $originalFilename,
        public int $size,
    ) {
    }
}
