<?php

declare(strict_types=1);

namespace App\Application\UseCases\Do\ListDos;

use App\Domain\Model\DenominationOfOrigin;
use App\Domain\Repository\DoRepository;

final readonly class ListDosHandler
{
    public function __construct(private DoRepository $dos)
    {
    }

    /** @return list<DenominationOfOrigin> */
    public function handle(): array
    {
        return $this->dos->findAll();
    }
}

