<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\GetWine;

final readonly class WinePhotoView
{
    public function __construct(
        public int $id,
        public ?string $type,
        public string $url,
        public string $hash,
        public int $size,
        public string $extension,
    ) {
    }
}
