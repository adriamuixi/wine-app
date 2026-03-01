<?php

declare(strict_types=1);

namespace App\Adapters\In\Http;

use App\Application\UseCases\Wine\CreateWinePhoto\CreateWinePhotoCommand;
use App\Application\UseCases\Wine\CreateWinePhoto\CreateWinePhotoHandler;
use App\Application\UseCases\Wine\CreateWinePhoto\CreateWinePhotoNotFound;
use App\Application\UseCases\Wine\CreateWinePhoto\CreateWinePhotoValidationException;
use App\Domain\Enum\WinePhotoType;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Routing\Attribute\Route;

final class WinePhotoController
{
    public function __construct(private readonly CreateWinePhotoHandler $createWinePhotoHandler)
    {
    }

    #[Route('/api/wines/{id}/photos', name: 'api_wine_photos_create', methods: ['POST'])]
    public function create(int $id, Request $request): JsonResponse
    {
        $typeRaw = $request->request->get('type');
        if (!is_string($typeRaw)) {
            return new JsonResponse(['error' => 'type is required.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $type = WinePhotoType::from($typeRaw);
        } catch (\ValueError) {
            return new JsonResponse(['error' => 'Invalid photo type.'], Response::HTTP_BAD_REQUEST);
        }

        $file = $request->files->get('file');
        if (!$file instanceof UploadedFile) {
            return new JsonResponse(['error' => 'file is required.'], Response::HTTP_BAD_REQUEST);
        }

        if (!$file->isValid()) {
            return new JsonResponse(['error' => 'Uploaded file is invalid.'], Response::HTTP_BAD_REQUEST);
        }

        $sourcePath = $file->getPathname();
        if (!is_string($sourcePath) || '' === $sourcePath) {
            return new JsonResponse(['error' => 'Unable to read uploaded file.'], Response::HTTP_BAD_REQUEST);
        }

        $size = $file->getSize();
        if (!is_int($size)) {
            return new JsonResponse(['error' => 'Unable to determine file size.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $result = $this->createWinePhotoHandler->handle(
                new CreateWinePhotoCommand(
                    wineId: $id,
                    type: $type,
                    sourcePath: $sourcePath,
                    originalFilename: $file->getClientOriginalName(),
                    size: $size,
                ),
            );
        } catch (CreateWinePhotoValidationException $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (CreateWinePhotoNotFound $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse([
            'photo' => [
                'id' => $result->id,
                'wine_id' => $result->wineId,
                'type' => $result->type->value,
                'url' => $result->url,
                'hash' => $result->hash,
                'size' => $result->size,
                'extension' => $result->extension,
            ],
        ], Response::HTTP_CREATED);
    }
}
