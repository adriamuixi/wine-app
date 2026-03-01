<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Enum\Country;
use App\Domain\Model\DenominationOfOrigin;

interface DoRepository
{
    public function findById(int $id): ?DenominationOfOrigin;

    public function findCountryById(int $id): ?Country;
}
