<?php

declare(strict_types=1);

namespace App\Application\UseCases\Do\CreateDo;

final readonly class CreateDoResult
{
    public function __construct(public int $id)
    {
    }
}
