<?php

declare(strict_types=1);

namespace App\Domain\Model;

use App\Domain\Enum\GrapeColor;

final readonly class WineGrape
{
    public function __construct(
        public int $grapeId,
        public ?string $percentage,
        public ?string $name = null,
        public ?GrapeColor $color = null,
    ) {
        if ($this->grapeId < 1) {
            throw new \InvalidArgumentException('grape_id must be >= 1.');
        }

        if (null !== $this->name && '' === trim($this->name)) {
            throw new \InvalidArgumentException('grape name must not be empty.');
        }

        if (null !== $this->percentage) {
            if (!is_numeric($this->percentage)) {
                throw new \InvalidArgumentException('grapes.percentage must be numeric.');
            }

            $value = (float) $this->percentage;
            if ($value < 0 || $value > 100) {
                throw new \InvalidArgumentException('grapes.percentage must be between 0 and 100.');
            }
        }
    }

    public function percentageAsFloat(): ?float
    {
        return null === $this->percentage ? null : (float) $this->percentage;
    }
}
