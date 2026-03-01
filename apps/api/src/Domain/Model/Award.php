<?php

declare(strict_types=1);

namespace App\Domain\Model;

use App\Domain\Enum\AwardName;

final readonly class Award
{
    public function __construct(
        public AwardName $name,
        public ?string $score,
        public ?int $year,
        public ?int $id = null,
    ) {
        if (null !== $this->id && $this->id < 1) {
            throw new \InvalidArgumentException('award id must be >= 1.');
        }

        if (null !== $this->score) {
            if (!is_numeric($this->score)) {
                throw new \InvalidArgumentException('awards.score must be between 0 and 100.');
            }

            $value = (float) $this->score;
            if ($value < 0 || $value > 100) {
                throw new \InvalidArgumentException('awards.score must be between 0 and 100.');
            }
        }

        if (null !== $this->year && ($this->year < 1800 || $this->year > 2200)) {
            throw new \InvalidArgumentException('awards.year must be between 1800 and 2200.');
        }
    }

    public function scoreAsFloat(): ?float
    {
        return null === $this->score ? null : (float) $this->score;
    }
}
