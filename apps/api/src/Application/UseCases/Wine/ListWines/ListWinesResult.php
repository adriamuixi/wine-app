<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\ListWines;

final readonly class ListWinesResult
{
    /**
     * @param list<WineListItemView> $items
     */
    public function __construct(
        public array $items,
        public int $page,
        public int $limit,
        public int $totalItems,
        public int $totalPages,
    ) {
    }
}
