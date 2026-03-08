<?php

declare(strict_types=1);

namespace App\Application\UseCases\Do\CreateDoAsset;

use App\Application\Ports\PhotoStoragePort;
use App\Domain\Enum\DoAssetType;
use App\Domain\Repository\DoRepository;

final readonly class CreateDoAssetHandler
{
    public function __construct(
        private DoRepository $dos,
        private PhotoStoragePort $assetStorage,
    ) {
    }

    public function handle(CreateDoAssetCommand $command): CreateDoAssetResult
    {
        $do = $this->dos->findById($command->doId);
        if (null === $do) {
            throw new CreateDoAssetNotFound(sprintf('DO not found for id %d.', $command->doId));
        }

        if ($command->size <= 0) {
            throw new CreateDoAssetValidationException('Uploaded file is empty.');
        }

        if (!is_file($command->sourcePath)) {
            throw new CreateDoAssetValidationException('Uploaded file path is invalid.');
        }

        $extension = $this->extractExtension($command->originalFilename);
        $rawBaseName = match ($command->type) {
            DoAssetType::DoLogo => $do->name,
            DoAssetType::RegionLogo => $do->region,
        };
        $filename = $this->assetStorage->save(
            $command->sourcePath,
            $command->doId,
            $command->type->value.'::'.$rawBaseName,
            $extension,
        );

        $url = match ($command->type) {
            DoAssetType::DoLogo => '/images/icons/DO/'.$filename,
            DoAssetType::RegionLogo => '/images/flags/regions/'.$filename,
        };

        return new CreateDoAssetResult(
            doId: $command->doId,
            type: $command->type,
            filename: $filename,
            url: $url,
        );
    }

    private function extractExtension(string $originalFilename): string
    {
        $extension = strtolower((string) pathinfo($originalFilename, PATHINFO_EXTENSION));
        $extension = preg_replace('/[^a-z0-9]/', '', $extension) ?? '';

        return '' === $extension ? 'bin' : substr($extension, 0, 10);
    }
}
