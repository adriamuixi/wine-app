<?php

declare(strict_types=1);

namespace App\Adapters\Out\Storage;

use App\Application\Ports\DoAssetStoragePort;
use App\Domain\Enum\DoAssetType;

final readonly class LocalDoAssetStorage implements DoAssetStoragePort
{
    public function __construct(
        private string $doLogoDir,
        private string $regionLogoDir,
    ) {
    }

    public function save(string $sourcePath, int $doId, DoAssetType $type, string $originalFilename, string $doName, string $regionName): string
    {
        $targetDir = match ($type) {
            DoAssetType::DoLogo => $this->doLogoDir,
            DoAssetType::RegionLogo => $this->regionLogoDir,
        };

        if (!is_dir($targetDir) && !mkdir($targetDir, 0775, true) && !is_dir($targetDir)) {
            throw new \RuntimeException(sprintf('Unable to create directory: %s', $targetDir));
        }

        $extension = $this->extractExtension($originalFilename);
        $basename = match ($type) {
            DoAssetType::DoLogo => $this->sanitizeBasename($doName).'_DO',
            DoAssetType::RegionLogo => $this->sanitizeBasename($regionName),
        };

        $filename = sprintf('%s.%s', $basename, $extension);
        $targetPath = rtrim($targetDir, '/').'/'.$filename;

        if (!copy($sourcePath, $targetPath)) {
            throw new \RuntimeException('Unable to store uploaded asset.');
        }

        return $filename;
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
