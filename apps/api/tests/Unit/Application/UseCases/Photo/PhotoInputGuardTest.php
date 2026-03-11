<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Photo;

use App\Application\UseCases\Photo\PhotoInputGuard;
use PHPUnit\Framework\TestCase;

final class PhotoInputGuardTest extends TestCase
{
    public function testExtractImageExtensionFromOriginalFilenameReturnsNormalizedExtension(): void
    {
        $guard = new PhotoInputGuard();

        self::assertSame('jpeg', $guard->extractImageExtensionFromOriginalFilename('Label.JPEG'));
    }

    public function testExtractImageExtensionFromOriginalFilenameThrowsForUnsupportedExtension(): void
    {
        $guard = new PhotoInputGuard();

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Unsupported image extension. Allowed: jpg, jpeg, png, webp, gif, avif.');

        $guard->extractImageExtensionFromOriginalFilename('asset.pdf');
    }

    public function testAssertImageFilenameThrowsForUnsupportedExtension(): void
    {
        $guard = new PhotoInputGuard();

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('do_logo must use an image extension: jpg, jpeg, png, webp, gif, avif.');

        $guard->assertImageFilename('do_logo.txt', 'do_logo');
    }
}
