<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\CreatePhoto;

use App\Domain\Enum\WinePhotoType;

final readonly class CreateWinePhotoResult
{
    public function __construct(
        public int $id,
        public int $wineId,
        public WinePhotoType $type,
        public string $url,
        public string $hash,
        public int $size,
        public string $extension,
    ) {
    }
}
