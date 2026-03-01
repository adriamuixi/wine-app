<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Enum\WinePhotoType;
use App\Domain\Model\WinePhoto;

interface WinePhotoRepository
{
    public function findByWineAndType(int $wineId, WinePhotoType $type): ?WinePhoto;

    /**
     * @return list<WinePhoto>
     */
    public function findByWineId(int $wineId): array;

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
}
