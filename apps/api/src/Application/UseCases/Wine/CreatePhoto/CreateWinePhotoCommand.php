<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\CreatePhoto;

use App\Domain\Enum\WinePhotoType;

final readonly class CreateWinePhotoCommand
{
    public function __construct(
        public int $wineId,
        public WinePhotoType $type,
        public string $sourcePath,
        public string $originalFilename,
        public int $size,
    ) {
    }
}
