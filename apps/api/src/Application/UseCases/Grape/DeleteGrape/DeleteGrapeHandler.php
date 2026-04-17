<?php

declare(strict_types=1);

namespace App\Application\UseCases\Grape\DeleteGrape;

use App\Domain\Repository\GrapeRepository;

final readonly class DeleteGrapeHandler
{
    public function __construct(private GrapeRepository $grapes)
    {
    }

    public function handle(int $grapeId): void
    {
        if ($this->grapes->hasAssociatedWines($grapeId)) {
            throw new DeleteGrapeHasAssociatedWines(sprintf('Grape %d cannot be deleted because it has associated wines.', $grapeId));
        }

        if (null === $this->grapes->findById($grapeId)) {
            throw new DeleteGrapeNotFound(sprintf('Grape not found for id %d.', $grapeId));
        }

        if (!$this->grapes->deleteById($grapeId)) {
            throw new DeleteGrapeNotFound(sprintf('Grape not found for id %d.', $grapeId));
        }
    }
}

