<?php

declare(strict_types=1);

namespace App\Adapters\Out\Storage;

use App\Application\Ports\PhotoStoragePort;

final readonly class LocalDoPhotoStorage implements PhotoStoragePort
{
    public function __construct(
        private string $doLogoDir,
        private string $regionLogoDir,
    ) {
    }

    public function save(string $sourcePath, int $wineId, string $hash, string $extension): string
    {
        [$assetType, $rawBaseName] = $this->parseStorageHash($hash);

        $targetDir = match ($assetType) {
            'do_logo' => $this->doLogoDir,
            'region_logo' => $this->regionLogoDir,
        };

        if (!is_dir($targetDir) && !mkdir($targetDir, 0775, true) && !is_dir($targetDir)) {
            throw new \RuntimeException(sprintf('Unable to create directory: %s', $targetDir));
        }

        $safeExtension = $this->extractExtension($extension);
        $basename = $this->sanitizeBasename($rawBaseName);
        if ('do_logo' === $assetType) {
            $basename .= '_DO';
        }

        $filename = sprintf('%s.%s', $basename, $safeExtension);
        $targetPath = rtrim($targetDir, '/').'/'.$filename;

        if (!copy($sourcePath, $targetPath)) {
            throw new \RuntimeException('Unable to store uploaded asset.');
        }

        return $filename;
    }

    public function deleteByUrl(string $entity, string $url): void
    {
        if ('do' !== $entity) {
            return;
        }

        if (!str_starts_with($url, '/images/icons/DO/')) {
            return;
        }

        $safeName = basename(trim($url));
        if ('' === $safeName) {
            return;
        }

        $path = rtrim($this->doLogoDir, '/').'/'.$safeName;
        if (!is_file($path)) {
            return;
        }

        if (!unlink($path)) {
            throw new \RuntimeException(sprintf('Unable to delete DO logo: %s', $path));
        }
    }

    public function deleteDirectory(string $entity, int $wineId): void
    {
        // DO assets are shared directories and must not be deleted by entity id.
    }

    /**
     * @return array{0:'do_logo'|'region_logo',1:string}
     */
    private function parseStorageHash(string $hash): array
    {
        $parts = explode('::', $hash, 2);
        $assetType = $parts[0] ?? 'do_logo';
        $rawBaseName = $parts[1] ?? $hash;

        if ('region_logo' !== $assetType) {
            $assetType = 'do_logo';
        }

        return [$assetType, $rawBaseName];
    }

    private function extractExtension(string $originalFilename): string
    {
        $extension = strtolower((string) pathinfo($originalFilename, PATHINFO_EXTENSION));
        $extension = preg_replace('/[^a-z0-9]/', '', $extension) ?? '';

        return '' === $extension ? 'bin' : substr($extension, 0, 10);
    }

    private function sanitizeBasename(string $value): string
    {
        $normalized = strtolower(trim($value));
        $normalized = str_replace(
            ['á', 'à', 'ä', 'â', 'é', 'è', 'ë', 'ê', 'í', 'ì', 'ï', 'î', 'ó', 'ò', 'ö', 'ô', 'ú', 'ù', 'ü', 'û', 'ñ', 'ç'],
            ['a', 'a', 'a', 'a', 'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', 'o', 'o', 'o', 'o', 'u', 'u', 'u', 'u', 'n', 'c'],
            $normalized,
        );
        $normalized = preg_replace('/[^a-z0-9]+/', '_', $normalized) ?? '';
        $normalized = trim($normalized, '_');

        return '' === $normalized ? 'do_asset' : substr($normalized, 0, 80);
    }
}
