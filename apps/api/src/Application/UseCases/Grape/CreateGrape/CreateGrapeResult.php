<?php

declare(strict_types=1);

namespace App\Application\UseCases\Grape\CreateGrape;

final readonly class CreateGrapeResult
{
    public function __construct(public int $id)
    {
    }
}

