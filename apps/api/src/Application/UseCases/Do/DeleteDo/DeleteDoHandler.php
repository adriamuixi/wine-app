<?php

declare(strict_types=1);

namespace App\Application\UseCases\Do\DeleteDo;

use App\Domain\Repository\DoRepository;

final readonly class DeleteDoHandler
{
    public function __construct(private DoRepository $dos)
    {
    }

    public function handle(int $doId): void
    {
        if ($this->dos->hasAssociatedWines($doId)) {
            throw new DeleteDoHasAssociatedWines(sprintf('DO %d cannot be deleted because it has associated wines.', $doId));
        }

        if (!$this->dos->deleteById($doId)) {
            throw new DeleteDoNotFound(sprintf('DO not found for id %d.', $doId));
        }
    }
}
