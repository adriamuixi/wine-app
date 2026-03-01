<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\CreateWinePhoto;

use App\Application\Ports\WinePhotoStoragePort;
use App\Domain\Repository\WinePhotoRepository;
use App\Domain\Repository\WineRepository;

final readonly class CreateWinePhotoHandler
{
    public function __construct(
        private WineRepository $wines,
        private WinePhotoRepository $photos,
        private WinePhotoStoragePort $photoStorage,
    ) {
    }

    public function handle(CreateWinePhotoCommand $command): CreateWinePhotoResult
    {
        if (!$this->wines->existsById($command->wineId)) {
            throw new CreateWinePhotoNotFound(sprintf('Wine not found for id %d.', $command->wineId));
        }

        if ($command->size <= 0) {
            throw new CreateWinePhotoValidationException('Uploaded file is empty.');
        }

        if (!is_file($command->sourcePath)) {
            throw new CreateWinePhotoValidationException('Uploaded file path is invalid.');
        }

        $extension = $this->extractExtension($command->originalFilename);
        $fullHash = hash_file('sha256', $command->sourcePath);
        if (!is_string($fullHash) || '' === $fullHash) {
            throw new CreateWinePhotoValidationException('Unable to calculate file hash.');
        }
        $hash = substr($fullHash, 0, 16);

        $existing = $this->photos->findByWineAndType($command->wineId, $command->type);
        $url = $this->photoStorage->save($command->sourcePath, $command->wineId, $hash, $extension);

        if (null === $existing) {
            $id = $this->photos->createForWine(
                wineId: $command->wineId,
                type: $command->type,
                url: $url,
                hash: $hash,
                size: $command->size,
                extension: $extension,
            );
        } else {
            $id = $existing->id;
            $this->photos->updateById($existing->id, $url, $hash, $command->size, $extension);
            $this->photoStorage->deleteByUrl($existing->url);
        }

        return new CreateWinePhotoResult(
            id: $id,
            wineId: $command->wineId,
            type: $command->type,
            url: $url,
            hash: $hash,
            size: $command->size,
            extension: $extension,
        );
    }

    private function extractExtension(string $originalFilename): string
    {
        $extension = strtolower((string) pathinfo($originalFilename, PATHINFO_EXTENSION));
        $extension = preg_replace('/[^a-z0-9]/', '', $extension) ?? '';

        return '' === $extension ? 'bin' : substr($extension, 0, 10);
    }
}
