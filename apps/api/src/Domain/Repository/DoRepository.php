<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Enum\Country;
use App\Domain\Model\DenominationOfOrigin;

interface DoRepository
{
    public function create(DenominationOfOrigin $do): int;

    public function findById(int $id): ?DenominationOfOrigin;

    public function findCountryById(int $id): ?Country;

    /**
     * @param list<string> $sortFields
     *
     * @return list<DenominationOfOrigin>
     */
    public function findAll(array $sortFields = []): array;

    public function update(DenominationOfOrigin $do): bool;

    public function deleteById(int $id): bool;

    public function hasAssociatedWines(int $id): bool;
}
