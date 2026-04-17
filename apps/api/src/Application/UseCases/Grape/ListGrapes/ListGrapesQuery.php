<?php

declare(strict_types=1);

namespace App\Application\UseCases\Grape\ListGrapes;

use App\Domain\Enum\GrapeColor;

final readonly class ListGrapesQuery
{
    /**
     * @param list<string> $sortFields
     */
    public function __construct(
        public array $sortFields = ListGrapesSort::DEFAULT_ORDER,
        public ?string $name = null,
        public ?GrapeColor $color = null,
    ) {
    }
}

