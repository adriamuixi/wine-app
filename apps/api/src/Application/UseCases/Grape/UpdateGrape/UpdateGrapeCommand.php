<?php

declare(strict_types=1);

namespace App\Application\UseCases\Grape\UpdateGrape;

use App\Domain\Enum\GrapeColor;

final readonly class UpdateGrapeCommand
{
    /**
     * @param array<string,bool> $provided
     */
    public function __construct(
        public int $grapeId,
        public ?string $name,
        public ?GrapeColor $color,
        public array $provided,
    ) {
    }

    public function isProvided(string $field): bool
    {
        return ($this->provided[$field] ?? false) === true;
    }
}

