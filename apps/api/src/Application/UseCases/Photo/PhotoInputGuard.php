<?php

declare(strict_types=1);

namespace App\Application\UseCases\Photo;

final readonly class PhotoInputGuard
{
    /** @var list<string> */
    private const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];

    private const ALLOWED_IMAGE_EXTENSIONS_TEXT = 'jpg, jpeg, png, webp, gif, avif';

    public function extractImageExtensionFromOriginalFilename(string $originalFilename): string
    {
        $extension = strtolower((string) pathinfo($originalFilename, PATHINFO_EXTENSION));
        $extension = $this->normalizeExtension($extension);

        if ('' === $extension || !in_array($extension, self::ALLOWED_IMAGE_EXTENSIONS, true)) {
            throw new \InvalidArgumentException(
                sprintf('Unsupported image extension. Allowed: %s.', self::ALLOWED_IMAGE_EXTENSIONS_TEXT),
            );
        }

        return $extension;
    }

    public function assertImageFilename(string $filename, string $field): void
    {
        $extension = strtolower((string) pathinfo(trim($filename), PATHINFO_EXTENSION));
        $extension = $this->normalizeExtension($extension);

        if ('' === $extension || !in_array($extension, self::ALLOWED_IMAGE_EXTENSIONS, true)) {
            throw new \InvalidArgumentException(
                sprintf('%s must use an image extension: %s.', $field, self::ALLOWED_IMAGE_EXTENSIONS_TEXT),
            );
        }
    }

    private function normalizeExtension(string $extension): string
    {
        $normalized = preg_replace('/[^a-z0-9]/', '', $extension) ?? '';

        return substr($normalized, 0, 10);
    }
}
