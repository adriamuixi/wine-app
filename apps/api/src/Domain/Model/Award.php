<?php

declare(strict_types=1);

namespace App\Domain\Model;

use App\Domain\Enum\AwardName;

final readonly class Award
{
    private const DECANTER_VALUES = ['gold', 'silver', 'bronze', 'platinum'];

    public function __construct(
        public AwardName $name,
        public ?string $score,
        public ?int $year,
        public ?int $id = null,
        public ?string $value = null,
    ) {
        if (null !== $this->id && $this->id < 1) {
            throw new \InvalidArgumentException('award id must be >= 1.');
        }

        if ($this->name === AwardName::Decanter) {
            if (null !== $this->score) {
                throw new \InvalidArgumentException('awards.score must be null for decanter.');
            }

            if (null !== $this->year) {
                throw new \InvalidArgumentException('awards.year must be null for decanter.');
            }

            if (null !== $this->value && !in_array($this->value, self::DECANTER_VALUES, true)) {
                throw new \InvalidArgumentException('awards.value must be a valid decanter medal.');
            }

            return;
        }

        if ($this->name === AwardName::WineSpectator) {
            if (null !== $this->score) {
                throw new \InvalidArgumentException('awards.score must be null for wine_spectator.');
            }

            if (null !== $this->value) {
                throw new \InvalidArgumentException('awards.value must be null for wine_spectator.');
            }

            if (null !== $this->year && ($this->year < 1800 || $this->year > 2200)) {
                throw new \InvalidArgumentException('awards.year must be between 1800 and 2200.');
            }

            return;
        }

        if (null !== $this->value) {
            throw new \InvalidArgumentException('awards.value is only supported for decanter.');
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
