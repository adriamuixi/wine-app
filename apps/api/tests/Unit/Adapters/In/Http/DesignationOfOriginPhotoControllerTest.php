<?php

declare(strict_types=1);

namespace App\Tests\Unit\Adapters\In\Http;

use App\Adapters\In\Http\DesignationOfOriginPhotoController;
use App\Application\Ports\PhotoStoragePort;
use App\Application\UseCases\Photo\PhotoInputGuard;
use App\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOriginAsset\CreateDesignationOfOriginAssetCommand;
use App\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOriginAsset\CreateDesignationOfOriginAssetHandler;
use App\Domain\Enum\Country;
use App\Domain\Enum\DoAssetType;
use App\Domain\Model\DesignationOfOrigin;
use App\Domain\Repository\DesignationOfOriginRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

final class DesignationOfOriginPhotoControllerTest extends TestCase
{
    public function testCreateReturnsBadRequestWithoutType(): void
    {
        $controller = $this->controller();
        $request = Request::create('/api/dos/1/assets', 'POST');

        $response = $controller->create(1, $request);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testCreateReturnsBadRequestWithoutFile(): void
    {
        $controller = $this->controller();
        $request = Request::create('/api/dos/1/assets', 'POST', ['type' => 'do_logo']);

        $response = $controller->create(1, $request);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testCreateReturnsCreatedForValidUpload(): void
    {
        $controller = $this->controller(existingDoIds: [1]);

        $tmp = tempnam(sys_get_temp_dir(), 'do-asset-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, 'binary-data');

        $uploaded = new UploadedFile($tmp, 'rioja.png', null, null, true);
        $request = Request::create('/api/dos/1/assets', 'POST', ['type' => 'do_logo'], [], ['file' => $uploaded]);

        $response = $controller->create(1, $request);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_CREATED, $response->getStatusCode());
        self::assertSame('do_logo', $payload['asset']['type']);
        self::assertSame('saved_asset.png', $payload['asset']['filename']);
    }

    public function testCreateReturnsBadRequestForUnsupportedImageExtension(): void
    {
        $controller = $this->controller(existingDoIds: [1]);

        $tmp = tempnam(sys_get_temp_dir(), 'do-asset-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, 'binary-data');

        $uploaded = new UploadedFile($tmp, 'rioja.pdf', null, null, true);
        $request = Request::create('/api/dos/1/assets', 'POST', ['type' => 'do_logo'], [], ['file' => $uploaded]);

        $response = $controller->create(1, $request);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        self::assertSame('Unsupported image extension. Allowed: jpg, jpeg, png, webp, gif, avif.', $payload['error']);
    }

    /**
     * @param list<int> $existingDoIds
     */
    private function controller(array $existingDoIds = []): DesignationOfOriginPhotoController
    {
        return new DesignationOfOriginPhotoController(
            new CreateDesignationOfOriginAssetHandler(
                new DesignationOfOriginPhotoControllerInMemoryDesignationOfOriginRepository($existingDoIds),
                new DesignationOfOriginPhotoControllerSpyStorage(),
                new PhotoInputGuard(),
            ),
        );
    }
}

final class DesignationOfOriginPhotoControllerInMemoryDesignationOfOriginRepository implements DesignationOfOriginRepository
{
    /** @param list<int> $existingDoIds */
    public function __construct(private readonly array $existingDoIds)
    {
    }

    public function create(DesignationOfOrigin $do): int
    {
        return 0;
    }

    public function findById(int $id): ?DesignationOfOrigin
    {
        if (!in_array($id, $this->existingDoIds, true)) {
            return null;
        }

        return new DesignationOfOrigin($id, 'Rioja', 'La Rioja', Country::Spain, 'ES', 'rioja_DO.png', 'la_rioja.png');
    }

    public function findCountryById(int $id): ?Country
    {
        return null;
    }

    public function findAll(
        array $sortFields = [],
        ?string $name = null,
        ?Country $country = null,
        ?string $region = null,
        array $userIds = [],
    ): array
    {
        return [];
    }

    public function update(DesignationOfOrigin $do): bool
    {
        return in_array($do->id, $this->existingDoIds, true);
    }

    public function deleteById(int $id): bool
    {
        return false;
    }

    public function hasAssociatedWines(int $id): bool
    {
        return false;
    }
}

final class DesignationOfOriginPhotoControllerSpyStorage implements PhotoStoragePort
{
    public function save(string $sourcePath, int $wineId, string $hash, string $extension): string
    {
        return 'saved_asset.png';
    }

    public function deleteByUrl(string $entity, string $url): void
    {
    }

    public function deleteDirectory(string $entity, int $wineId): void
    {
    }
}
