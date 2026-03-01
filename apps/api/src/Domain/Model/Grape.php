<?php

declare(strict_types=1);

namespace App\Domain\Model;

use App\Domain\Enum\GrapeColor;

final readonly class Grape
{
    public function __construct(
        public int $id,
        public string $name,
        public GrapeColor $color,
    ) {
        if ($this->id < 1) {
            throw new \InvalidArgumentException('grape id must be >= 1.');
        }

        if ('' === trim($this->name)) {
            throw new \InvalidArgumentException('grape name is required.');
        }
    }
}
