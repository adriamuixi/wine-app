<?php

declare(strict_types=1);

namespace App\Tests\Unit\Adapters\Out\Storage;

use App\Adapters\Out\Storage\LocalDesignationOfOriginPhotoStorage;
use PHPUnit\Framework\TestCase;

final class LocalDesignationOfOriginPhotoStorageTest extends TestCase
{
    public function testSaveUsesProvidedExtensionForDoLogo(): void
    {
        $base = sys_get_temp_dir().'/do-photo-storage-'.uniqid('', true);
        $doLogoDir = $base.'/icons/DO';
        $regionLogoDir = $base.'/flags/regions';
        mkdir($base, 0775, true);

        $tmp = tempnam(sys_get_temp_dir(), 'do-photo-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, 'image-content');

        $storage = new LocalDesignationOfOriginPhotoStorage($doLogoDir, $regionLogoDir);
        $filename = $storage->save($tmp, 10, 'do_logo::Rioja', 'png');

        self::assertSame('rioja_DO.png', $filename);
        self::assertFileExists($doLogoDir.'/rioja_DO.png');
    }
}
