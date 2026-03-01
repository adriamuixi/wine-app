<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Repos;

use App\Adapters\Out\Storage\LocalWinePhotoStorage;
use App\Domain\Enum\WinePhotoType;
use App\Domain\Model\WinePhoto;
use App\Domain\Repository\WinePhotoRepository;

final readonly class WinePhotoRepositoryAdapter implements WinePhotoRepository
{
    public function __construct(
        private DoctrinePhotoRepository $photoRepository,
        private LocalWinePhotoStorage $photoStorage,
    ) {
    }

    public function findByWineAndType(int $wineId, WinePhotoType $type): ?WinePhoto
    {
        return $this->photoRepository->findByWineAndType($wineId, $type);
    }

    public function createForWine(
        int $wineId,
        WinePhotoType $type,
        string $url,
        string $hash,
        int $size,
        string $extension,
    ): int {
        return $this->photoRepository->createForWine($wineId, $type, $url, $hash, $size, $extension);
    }

    public function updateById(
        int $id,
        string $url,
        string $hash,
        int $size,
        string $extension,
    ): void {
        $this->photoRepository->updateById($id, $url, $hash, $size, $extension);
    }

    public function findUrlsByWineId(int $wineId): array
    {
        return $this->photoRepository->findUrlsByWineId($wineId);
    }

    public function save(string $sourcePath, int $wineId, string $hash, string $extension): string
    {
        return $this->photoStorage->save($sourcePath, $wineId, $hash, $extension);
    }

    public function deleteByUrl(string $url): void
    {
        $this->photoStorage->deleteByUrl($url);
    }

    public function deleteWineDirectory(int $wineId): void
    {
        $this->photoStorage->deleteWineDirectory($wineId);
    }
}
