<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\DeleteWine;

use App\Domain\Repository\WinePhotoRepository;
use App\Domain\Repository\WineRepository;

final readonly class DeleteWineHandler
{
    public function __construct(
        private WineRepository $wines,
        private WinePhotoRepository $photos,
    )
    {
    }

    public function handle(int $wineId): void
    {
        $photoUrls = $this->photos->findUrlsByWineId($wineId);

        if (!$this->wines->deleteById($wineId)) {
            throw new WineNotFound(sprintf('Wine not found for id %d.', $wineId));
        }

        foreach ($photoUrls as $url) {
            $this->photos->deleteByUrl($url);
        }

        $this->photos->deleteWineDirectory($wineId);
    }
}
