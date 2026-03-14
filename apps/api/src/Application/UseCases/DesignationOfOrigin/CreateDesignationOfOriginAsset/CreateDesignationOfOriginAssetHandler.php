<?php

declare(strict_types=1);

namespace App\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOriginAsset;

use App\Application\Ports\PhotoStoragePort;
use App\Application\UseCases\Photo\PhotoInputGuard;
use App\Domain\Enum\DoAssetType;
use App\Domain\Model\DesignationOfOrigin;
use App\Domain\Repository\DesignationOfOriginRepository;

final readonly class CreateDesignationOfOriginAssetHandler
{
    public function __construct(
        private DesignationOfOriginRepository $dos,
        private PhotoStoragePort $assetStorage,
        private PhotoInputGuard $photoInputGuard,
    ) {
    }

    public function handle(CreateDesignationOfOriginAssetCommand $command): CreateDesignationOfOriginAssetResult
    {
        $do = $this->dos->findById($command->doId);
        if (null === $do) {
            throw new CreateDesignationOfOriginAssetNotFound(sprintf('DO not found for id %d.', $command->doId));
        }

        if ($command->size <= 0) {
            throw new CreateDesignationOfOriginAssetValidationException('Uploaded file is empty.');
        }

        if (!is_file($command->sourcePath)) {
            throw new CreateDesignationOfOriginAssetValidationException('Uploaded file path is invalid.');
        }

        try {
            $extension = $this->photoInputGuard->extractImageExtensionFromOriginalFilename($command->originalFilename);
        } catch (\InvalidArgumentException $exception) {
            throw new CreateDesignationOfOriginAssetValidationException($exception->getMessage(), previous: $exception);
        }
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

        $updatedDo = match ($command->type) {
            DoAssetType::DoLogo => new DesignationOfOrigin(
                id: $do->id,
                name: $do->name,
                region: $do->region,
                country: $do->country,
                countryCode: $do->countryCode,
                doLogo: $filename,
                regionLogo: $do->regionLogo,
            ),
            DoAssetType::RegionLogo => new DesignationOfOrigin(
                id: $do->id,
                name: $do->name,
                region: $do->region,
                country: $do->country,
                countryCode: $do->countryCode,
                doLogo: $do->doLogo,
                regionLogo: $filename,
            ),
        };

        if (!$this->dos->update($updatedDo)) {
            throw new CreateDesignationOfOriginAssetNotFound(sprintf('DO not found for id %d.', $command->doId));
        }

        return new CreateDesignationOfOriginAssetResult(
            doId: $command->doId,
            type: $command->type,
            filename: $filename,
            url: $url,
        );
    }
}
