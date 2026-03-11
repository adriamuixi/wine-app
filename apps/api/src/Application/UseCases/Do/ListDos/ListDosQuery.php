<?php

declare(strict_types=1);

namespace App\Application\UseCases\Do\ListDos;

use App\Domain\Enum\Country;

final readonly class ListDosQuery
{
    /** @param list<string> $sortFields */
    public function __construct(
        public array $sortFields = ListDosSort::DEFAULT_ORDER,
        public ?string $name = null,
        public ?Country $country = null,
        public ?string $region = null,
    ) {
    }
}
