<?php

declare(strict_types=1);

namespace App\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOrigin;

final readonly class CreateDesignationOfOriginResult
{
    public function __construct(public int $id)
    {
    }
}
