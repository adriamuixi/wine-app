<?php

declare(strict_types=1);

namespace App\Adapters\Out\Storage;

final readonly class LocalWinePhotoStorage
{
    public function __construct(private string $baseDir)
    {
    }

    public function save(string $sourcePath, int $wineId, string $hash, string $extension): string
    {
        $wineDir = rtrim($this->baseDir, '/').'/'.(string) $wineId;

        if (!is_dir($wineDir) && !mkdir($wineDir, 0775, true) && !is_dir($wineDir)) {
            throw new \RuntimeException(sprintf('Unable to create directory: %s', $wineDir));
        }

        $filename = sprintf('%s.%s', $hash, $extension);
        $targetPath = $wineDir.'/'.$filename;

        if (!copy($sourcePath, $targetPath)) {
            throw new \RuntimeException('Unable to store uploaded photo.');
        }

        return '/images/wines/'.$wineId.'/'.$filename;
    }

    public function deleteByUrl(string $url): void
    {
        if (!str_starts_with($url, '/images/wines/')) {
            throw new \RuntimeException('Invalid stored image url.');
        }

        $path = '/shared/public'.$url;
        if (!file_exists($path)) {
            return;
        }

        if (!unlink($path)) {
            throw new \RuntimeException(sprintf('Unable to delete old image: %s', $path));
        }
    }

    public function deleteWineDirectory(int $wineId): void
    {
        $wineDir = rtrim($this->baseDir, '/').'/'.$wineId;
        if (!is_dir($wineDir)) {
            return;
        }

        $files = scandir($wineDir);
        if (false === $files) {
            throw new \RuntimeException(sprintf('Unable to read wine photo directory: %s', $wineDir));
        }

        foreach ($files as $file) {
            if ('.' === $file || '..' === $file) {
                continue;
            }

            $filePath = $wineDir.'/'.$file;
            if (is_file($filePath) && !unlink($filePath)) {
                throw new \RuntimeException(sprintf('Unable to delete photo file: %s', $filePath));
            }
        }

        if (!rmdir($wineDir) && is_dir($wineDir)) {
            throw new \RuntimeException(sprintf('Unable to delete wine photo directory: %s', $wineDir));
        }
    }
}
