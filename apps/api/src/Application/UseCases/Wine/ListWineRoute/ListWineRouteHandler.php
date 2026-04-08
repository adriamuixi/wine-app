<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\ListWineRoute;

use App\Domain\Repository\WineRepository;

final readonly class ListWineRouteHandler
{
    public function __construct(private WineRepository $wines)
    {
    }

    public function handle(): ListWineRouteResult
    {
        return new ListWineRouteResult(
            items: $this->wines->listRouteStops(),
        );
    }
}
