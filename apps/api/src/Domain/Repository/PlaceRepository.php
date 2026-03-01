<?php

declare(strict_types=1);

namespace App\Domain\Repository;

interface PlaceRepository
{
    /**
     * @param list<int> $ids
     *
     * @return list<int>
     */
    public function findExistingIds(array $ids): array;
}
