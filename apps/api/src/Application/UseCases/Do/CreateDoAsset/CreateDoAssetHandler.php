<?php

declare(strict_types=1);

namespace App\Application\UseCases\Do\CreateDoAsset;

use App\Application\Ports\DoAssetStoragePort;
use App\Domain\Enum\DoAssetType;
use App\Domain\Repository\DoRepository;

final readonly class CreateDoAssetHandler
{
    public function __construct(
        private DoRepository $dos,
        private DoAssetStoragePort $assetStorage,
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

        $filename = $this->assetStorage->save(
            $command->sourcePath,
            $command->doId,
            $command->type,
            $command->originalFilename,
            $do->name,
            $do->region,
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
}
