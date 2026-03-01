<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Application\UseCases\Wine\CreateWine\CreateWineCommand;
use App\Application\UseCases\Wine\GetWine\WineDetailsView;
use App\Application\UseCases\Wine\ListWines\ListWinesQuery;
use App\Application\UseCases\Wine\ListWines\ListWinesResult;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineCommand;
use App\Domain\Enum\Country;

interface WineRepository
{
    public function createWithRelations(CreateWineCommand $command, ?Country $country): int;

    public function updatePartial(UpdateWineCommand $command): bool;

    public function deleteById(int $id): bool;

    public function existsById(int $id): bool;

    public function findDetailsById(int $id): ?WineDetailsView;

    public function findPaginated(ListWinesQuery $query): ListWinesResult;
}
