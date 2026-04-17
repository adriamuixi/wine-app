<?php

declare(strict_types=1);

namespace App\Application\UseCases\Grape\CreateGrape;

use App\Domain\Enum\GrapeColor;

final readonly class CreateGrapeCommand
{
    public function __construct(
        public string $name,
        public GrapeColor $color,
    ) {
    }
}

