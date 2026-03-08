<?php

declare(strict_types=1);

namespace App\Application\UseCases\Do\DeleteDo;

use App\Application\Ports\PhotoStoragePort;
use App\Domain\Repository\DoRepository;

final readonly class DeleteDoHandler
{
    public function __construct(
        private DoRepository $dos,
        private PhotoStoragePort $assets,
    )
    {
    }

    public function handle(int $doId): void
    {
        if ($this->dos->hasAssociatedWines($doId)) {
            throw new DeleteDoHasAssociatedWines(sprintf('DO %d cannot be deleted because it has associated wines.', $doId));
        }

        $existing = $this->dos->findById($doId);
        if (null === $existing) {
            throw new DeleteDoNotFound(sprintf('DO not found for id %d.', $doId));
        }

        if (!$this->dos->deleteById($doId)) {
            throw new DeleteDoNotFound(sprintf('DO not found for id %d.', $doId));
        }

        if (null !== $existing->doLogo) {
            $this->assets->deleteByUrl('do', '/images/icons/DO/'.$existing->doLogo);
        }
    }
}
