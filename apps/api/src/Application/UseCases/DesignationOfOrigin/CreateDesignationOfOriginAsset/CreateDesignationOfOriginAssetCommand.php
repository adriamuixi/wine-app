<?php

declare(strict_types=1);

namespace App\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOriginAsset;

use App\Domain\Enum\DoAssetType;

final readonly class CreateDesignationOfOriginAssetCommand
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
