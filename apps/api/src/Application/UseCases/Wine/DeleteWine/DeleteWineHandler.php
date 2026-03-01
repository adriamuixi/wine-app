<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\DeleteWine;

use App\Application\Ports\WinePhotoStoragePort;
use App\Domain\Repository\WinePhotoRepository;
use App\Domain\Repository\WineRepository;

final readonly class DeleteWineHandler
{
    public function __construct(
        private WineRepository $wines,
        private WinePhotoRepository $photos,
        private WinePhotoStoragePort $photoStorage,
    )
    {
    }

    public function handle(int $wineId): void
    {
        $photoEntities = $this->photos->findByWineId($wineId);

        if (!$this->wines->deleteById($wineId)) {
            throw new WineNotFound(sprintf('Wine not found for id %d.', $wineId));
        }

        foreach ($photoEntities as $photo) {
            $this->photoStorage->deleteByUrl($photo->url);
        }

        $this->photoStorage->deleteWineDirectory($wineId);
    }
}
