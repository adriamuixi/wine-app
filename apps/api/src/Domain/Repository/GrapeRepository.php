<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Model\Grape;

interface GrapeRepository
{
    /**
     * @param list<int> $ids
     *
     * @return list<int>
     */
    public function findExistingIds(array $ids): array;

    /** @return list<Grape> */
    public function findAll(): array;
}
