<?php

declare(strict_types=1);

namespace App\Domain\Model;

use App\Domain\Enum\WinePhotoType;

final readonly class WinePhoto
{
    public function __construct(
        public ?int $id,
        public string $url,
        public WinePhotoType $type,
        public ?string $hash = null,
        public ?int $size = null,
        public ?string $extension = null,
    ) {
        if ('' === trim($this->url)) {
            throw new \InvalidArgumentException('photo url is required.');
        }

        if (null !== $this->hash && '' === trim($this->hash)) {
            throw new \InvalidArgumentException('photo hash must not be empty.');
        }

        if (null !== $this->size && $this->size < 0) {
            throw new \InvalidArgumentException('photo size must be >= 0.');
        }

        if (null !== $this->extension && '' === trim($this->extension)) {
            throw new \InvalidArgumentException('photo extension must not be empty.');
        }
    }
}
