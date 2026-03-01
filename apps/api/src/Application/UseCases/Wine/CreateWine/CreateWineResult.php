<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\CreateWine;

final readonly class CreateWineResult
{
    public function __construct(public int $id)
    {
    }
}
