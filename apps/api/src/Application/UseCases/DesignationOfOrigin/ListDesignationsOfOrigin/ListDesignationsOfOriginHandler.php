<?php

declare(strict_types=1);

namespace App\Application\UseCases\DesignationOfOrigin\ListDesignationsOfOrigin;

use App\Domain\Model\DesignationOfOrigin;
use App\Domain\Repository\DesignationOfOriginRepository;

final readonly class ListDesignationsOfOriginHandler
{
    public function __construct(private DesignationOfOriginRepository $dos)
    {
    }

    /** @return list<DesignationOfOrigin> */
    public function handle(ListDesignationsOfOriginQuery $query = new ListDesignationsOfOriginQuery()): array
    {
        return $this->dos->findAll(
            sortFields: $query->sortFields,
            name: $query->name,
            country: $query->country,
            region: $query->region,
            userIds: $query->userIds,
            hasWines: $query->hasWines,
        );
    }
}
