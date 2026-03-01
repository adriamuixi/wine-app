<?php

declare(strict_types=1);

namespace App\Tests\Unit\Adapters\In\Http;

use App\Adapters\In\Http\WinePhotoController;
use App\Domain\Repository\WinePhotoRepository;
use App\Domain\Repository\WineRepository;
use App\Application\UseCases\Wine\CreatePhoto\CreateWinePhotoCommand;
use App\Application\UseCases\Wine\CreatePhoto\CreateWinePhotoHandler;
use App\Domain\Model\WinePhoto;
use App\Application\UseCases\Wine\CreateWine\CreateWineCommand;
use App\Application\UseCases\Wine\GetWine\WineDetailsView;
use App\Application\UseCases\Wine\ListWines\ListWinesQuery;
use App\Application\UseCases\Wine\ListWines\ListWinesResult;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineCommand;
use App\Domain\Enum\Country;
use App\Domain\Enum\WinePhotoType;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

final class WinePhotoControllerTest extends TestCase
{
    public function testCreateReturnsBadRequestWithoutType(): void
    {
        $controller = $this->controller();
        $request = Request::create('/api/wines/1/photos', 'POST');

        $response = $controller->create(1, $request);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testCreateReturnsBadRequestWithoutFile(): void
    {
        $controller = $this->controller();
        $request = Request::create('/api/wines/1/photos', 'POST', ['type' => 'bottle']);

        $response = $controller->create(1, $request);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testCreateReturnsCreatedForValidUpload(): void
    {
        $controller = $this->controller(existingWineIds: [1]);

        $tmp = tempnam(sys_get_temp_dir(), 'wine-photo-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, 'binary-data');

        $uploaded = new UploadedFile($tmp, 'front.jpg', null, null, true);
        $request = Request::create('/api/wines/1/photos', 'POST', ['type' => 'front_label'], [], ['file' => $uploaded]);

        $response = $controller->create(1, $request);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_CREATED, $response->getStatusCode());
        self::assertSame(88, $payload['photo']['id']);
        self::assertSame('front_label', $payload['photo']['type']);
    }

    /**
     * @param list<int> $existingWineIds
     */
    private function controller(array $existingWineIds = []): WinePhotoController
    {
        return new WinePhotoController(
            new CreateWinePhotoHandler(
                new PhotoControllerSpyWineRepository($existingWineIds),
                new PhotoControllerSpyWinePhotoRepository(),
            ),
        );
    }
}

final class PhotoControllerSpyWineRepository implements WineRepository
{
    /** @param list<int> $existingWineIds */
    public function __construct(private readonly array $existingWineIds)
    {
    }

    public function createWithRelations(CreateWineCommand $command, ?Country $country): int
    {
        return 1;
    }

    public function updatePartial(UpdateWineCommand $command): bool
    {
        return false;
    }

    public function deleteById(int $id): bool
    {
        return false;
    }

    public function existsById(int $id): bool
    {
        return in_array($id, $this->existingWineIds, true);
    }

    public function findDetailsById(int $id): ?WineDetailsView
    {
        return null;
    }

    public function findPaginated(ListWinesQuery $query): ListWinesResult
    {
        return new ListWinesResult([], $query->page, $query->limit, 0, 0);
    }
}

final class PhotoControllerSpyWinePhotoRepository implements WinePhotoRepository
{
    public function findByWineAndType(int $wineId, WinePhotoType $type): ?WinePhoto
    {
        return null;
    }

    public function createForWine(
        int $wineId,
        WinePhotoType $type,
        string $url,
        string $hash,
        int $size,
        string $extension,
    ): int {
        return 88;
    }

    public function updateById(
        int $id,
        string $url,
        string $hash,
        int $size,
        string $extension,
    ): void {
    }

    public function findUrlsByWineId(int $wineId): array
    {
        return [];
    }

    public function save(string $sourcePath, int $wineId, string $hash, string $extension): string
    {
        return '/images/wines/'.$wineId.'/hash.'.$extension;
    }

    public function deleteByUrl(string $url): void
    {
    }

    public function deleteWineDirectory(int $wineId): void
    {
    }
}
