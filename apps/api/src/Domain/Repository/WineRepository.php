<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Application\UseCases\Wine\CreateWine\CreateWineCommand;
use App\Application\UseCases\Wine\ListWines\ListWinesQuery;
use App\Application\UseCases\Wine\ListWines\ListWinesResult;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineCommand;
use App\Domain\Enum\Country;
use App\Domain\Model\Wine;

interface WineRepository
{
    public function create(CreateWineCommand $command, ?Country $country): int;

    public function updatePartial(UpdateWineCommand $command): bool;

    public function deleteById(int $id): bool;

    public function existsById(int $id): bool;

    public function findById(int $id): ?Wine;

    public function findPaginated(ListWinesQuery $query): ListWinesResult;
}
