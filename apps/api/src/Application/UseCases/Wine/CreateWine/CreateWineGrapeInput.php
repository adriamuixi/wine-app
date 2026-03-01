<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\CreateWine;

final readonly class CreateWineGrapeInput
{
    public function __construct(
        public int $grapeId,
        public ?string $percentage,
    ) {
    }
}
