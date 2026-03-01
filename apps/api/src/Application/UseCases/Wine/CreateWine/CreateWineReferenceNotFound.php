<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\CreateWine;

final class CreateWineReferenceNotFound extends \RuntimeException
{
    /**
     * @param list<int> $missingIds
     */
    public static function forIds(string $resource, array $missingIds): self
    {
        sort($missingIds);

        return new self(sprintf('%s not found for ids: %s', $resource, implode(', ', $missingIds)));
    }
}
