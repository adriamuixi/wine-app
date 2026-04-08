<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Enum\Country;
use App\Domain\Model\DesignationOfOrigin;

interface DesignationOfOriginRepository
{
    public function create(DesignationOfOrigin $do): int;

    public function findById(int $id): ?DesignationOfOrigin;

    public function findCountryById(int $id): ?Country;

    /**
     * @param list<string> $sortFields
     * @param list<int>    $userIds
     *
     * @return list<DesignationOfOrigin>
     */
    public function findAll(
        array $sortFields = [],
        ?string $name = null,
        ?Country $country = null,
        ?string $region = null,
        array $userIds = [],
        ?bool $hasWines = null,
    ): array;

    public function update(DesignationOfOrigin $do): bool;

    public function deleteById(int $id): bool;

    public function hasAssociatedWines(int $id): bool;
}
