<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\GetWine;

use App\Domain\Repository\WineRepository;

final readonly class GetWineDetailsHandler
{
    public function __construct(private WineRepository $wines)
    {
    }

    public function handle(int $wineId): WineDetailsView
    {
        $wine = $this->wines->findDetailsById($wineId);
        if (null === $wine) {
            throw new GetWineDetailsNotFound(sprintf('Wine not found for id %d.', $wineId));
        }

        return $wine;
    }
}
