<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\CreateWine;

use App\Domain\Enum\AwardName;

final readonly class CreateWineAwardInput
{
    public function __construct(
        public AwardName $name,
        public ?string $score,
        public ?int $year,
    ) {
    }
}
