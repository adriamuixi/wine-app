<?php

declare(strict_types=1);

namespace App\Application\UseCases\Do\CreateDoAsset;

use App\Domain\Enum\DoAssetType;

final readonly class CreateDoAssetResult
{
    public function __construct(
        public int $doId,
        public DoAssetType $type,
        public string $filename,
        public string $url,
    ) {
    }
}
