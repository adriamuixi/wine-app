<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Enum\GrapeColor;
use App\Domain\Model\Grape;

interface GrapeRepository
{
    /**
     * @param list<int> $ids
     *
     * @return list<int>
     */
    public function findExistingIds(array $ids): array;

    public function create(Grape $grape): int;

    public function findById(int $id): ?Grape;

    /**
     * @param list<string> $sortFields
     *
     * @return list<Grape>
     */
    public function findAll(array $sortFields = [], ?string $name = null, ?GrapeColor $color = null): array;

    public function update(Grape $grape): bool;

    public function deleteById(int $id): bool;

    public function hasAssociatedWines(int $id): bool;
}
