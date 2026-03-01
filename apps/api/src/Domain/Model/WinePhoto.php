<?php

declare(strict_types=1);

namespace App\Domain\Model;

use App\Domain\Enum\WinePhotoType;

final readonly class WinePhoto
{
    public function __construct(
        public int $id,
        public string $url,
        public WinePhotoType $type,
    ) {
        if ($this->id < 1) {
            throw new \InvalidArgumentException('photo id must be >= 1.');
        }

        if ('' === trim($this->url)) {
            throw new \InvalidArgumentException('photo url is required.');
        }
    }
}
