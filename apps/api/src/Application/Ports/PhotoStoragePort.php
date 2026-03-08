<?php

declare(strict_types=1);

namespace App\Application\Ports;

interface PhotoStoragePort
{
    public function save(string $sourcePath, int $wineId, string $hash, string $extension): string;

    public function deleteByUrl(string $entity, string $url): void;

    public function deleteDirectory(string $entity, int $wineId): void;
}
