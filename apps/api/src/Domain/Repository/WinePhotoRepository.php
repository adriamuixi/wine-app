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

    public function create(int $wineId, WinePhoto $photo): int;

    public function update(WinePhoto $photo): void;
}
