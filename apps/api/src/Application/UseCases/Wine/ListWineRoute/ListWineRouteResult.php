<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\ListWineRoute;

final readonly class ListWineRouteResult
{
    /**
     * @param list<WineRouteStopView> $items
     */
    public function __construct(
        public array $items,
    ) {
    }
}
