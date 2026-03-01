<?php

declare(strict_types=1);

namespace App\Application\UseCases\Grape\ListGrapes;

use App\Domain\Model\Grape;
use App\Domain\Repository\GrapeRepository;

final readonly class ListGrapesHandler
{
    public function __construct(private GrapeRepository $grapes)
    {
    }

    /** @return list<Grape> */
    public function handle(): array
    {
        return $this->grapes->findAll();
    }
}
