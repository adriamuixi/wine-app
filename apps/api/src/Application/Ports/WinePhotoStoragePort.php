<?php

declare(strict_types=1);

namespace App\Application\Ports;

interface WinePhotoStoragePort
{
    public function save(string $sourcePath, int $wineId, string $hash, string $extension): string;

    public function deleteByUrl(string $url): void;

    public function deleteWineDirectory(int $wineId): void;
}
