<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Enum\WinePhotoType;
use App\Domain\Model\WinePhoto;

interface WinePhotoRepository
{
    public function findByWineAndType(int $wineId, WinePhotoType $type): ?WinePhoto;

    public function createForWine(
        int $wineId,
        WinePhotoType $type,
        string $url,
        string $hash,
        int $size,
        string $extension,
    ): int;

    public function updateById(
        int $id,
        string $url,
        string $hash,
        int $size,
        string $extension,
    ): void;

    /**
     * @return list<string>
     */
    public function findUrlsByWineId(int $wineId): array;

    public function save(string $sourcePath, int $wineId, string $hash, string $extension): string;

    public function deleteByUrl(string $url): void;

    public function deleteWineDirectory(int $wineId): void;
}
