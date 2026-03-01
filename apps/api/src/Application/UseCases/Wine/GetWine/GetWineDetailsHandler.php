<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\GetWine;

use App\Domain\Model\Wine;
use App\Domain\Repository\WineRepository;

final readonly class GetWineDetailsHandler
{
    public function __construct(private WineRepository $wines)
    {
    }

    public function handle(int $wineId): Wine
    {
        $wine = $this->wines->findById($wineId);
        if (null === $wine) {
            throw new GetWineDetailsNotFound(sprintf('Wine not found for id %d.', $wineId));
        }

        return $wine;
    }
}
