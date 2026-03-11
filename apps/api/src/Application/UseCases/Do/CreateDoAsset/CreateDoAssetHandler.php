<?php

declare(strict_types=1);

namespace App\Application\UseCases\Do\CreateDoAsset;

use App\Application\Ports\PhotoStoragePort;
use App\Application\UseCases\Photo\PhotoInputGuard;
use App\Domain\Enum\DoAssetType;
use App\Domain\Model\DenominationOfOrigin;
use App\Domain\Repository\DoRepository;

final readonly class CreateDoAssetHandler
{
    public function __construct(
        private DoRepository $dos,
        private PhotoStoragePort $assetStorage,
        private PhotoInputGuard $photoInputGuard,
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

        try {
            $extension = $this->photoInputGuard->extractImageExtensionFromOriginalFilename($command->originalFilename);
        } catch (\InvalidArgumentException $exception) {
            throw new CreateDoAssetValidationException($exception->getMessage(), previous: $exception);
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
            DoAssetType::DoLogo => new DenominationOfOrigin(
                id: $do->id,
                name: $do->name,
                region: $do->region,
                country: $do->country,
                countryCode: $do->countryCode,
                doLogo: $filename,
                regionLogo: $do->regionLogo,
            ),
            DoAssetType::RegionLogo => new DenominationOfOrigin(
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
            throw new CreateDoAssetNotFound(sprintf('DO not found for id %d.', $command->doId));
        }

        return new CreateDoAssetResult(
            doId: $command->doId,
            type: $command->type,
            filename: $filename,
            url: $url,
        );
    }
}
