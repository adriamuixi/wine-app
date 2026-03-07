<?php

declare(strict_types=1);

namespace App\Application\UseCases\Do\ListDos;

final readonly class ListDosQuery
{
    /** @param list<string> $sortFields */
    public function __construct(
        public array $sortFields = ListDosSort::DEFAULT_ORDER,
    ) {
    }
}
