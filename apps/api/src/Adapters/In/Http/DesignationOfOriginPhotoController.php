<?php

declare(strict_types=1);

namespace App\Adapters\In\Http;

use App\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOriginAsset\CreateDesignationOfOriginAssetCommand;
use App\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOriginAsset\CreateDesignationOfOriginAssetHandler;
use App\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOriginAsset\CreateDesignationOfOriginAssetNotFound;
use App\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOriginAsset\CreateDesignationOfOriginAssetValidationException;
use App\Domain\Enum\DoAssetType;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class DesignationOfOriginPhotoController
{
    public function __construct(private readonly CreateDesignationOfOriginAssetHandler $createDoAssetHandler)
    {
    }

    #[Route('/api/dos/{id}/assets', name: 'api_do_photos_create', methods: ['POST'])]
    public function create(int $id, Request $request): JsonResponse
    {
        $typeRaw = $request->request->get('type');
        if (!is_string($typeRaw)) {
            return new JsonResponse(['error' => 'type is required.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $type = DoAssetType::from($typeRaw);
        } catch (\ValueError) {
            return new JsonResponse(['error' => 'Invalid DO asset type.'], Response::HTTP_BAD_REQUEST);
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
            $result = $this->createDoAssetHandler->handle(
                new CreateDesignationOfOriginAssetCommand(
                    doId: $id,
                    type: $type,
                    sourcePath: $sourcePath,
                    originalFilename: $file->getClientOriginalName(),
                    size: $size,
                ),
            );
        } catch (CreateDesignationOfOriginAssetValidationException $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (CreateDesignationOfOriginAssetNotFound $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse([
            'asset' => [
                'do_id' => $result->doId,
                'type' => $result->type->value,
                'filename' => $result->filename,
                'url' => $result->url,
            ],
        ], Response::HTTP_CREATED);
    }
}
