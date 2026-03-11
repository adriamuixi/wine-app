<?php

declare(strict_types=1);

namespace App\Application\UseCases\Do\UpdateDo;

use App\Application\UseCases\Photo\PhotoInputGuard;
use App\Domain\Model\DenominationOfOrigin;
use App\Domain\Repository\DoRepository;

final readonly class UpdateDoHandler
{
    public function __construct(
        private DoRepository $dos,
        private PhotoInputGuard $photoInputGuard,
    )
    {
    }

    public function handle(UpdateDoCommand $command): void
    {
        try {
            $this->validatePatchRequest($command);
        } catch (\InvalidArgumentException $exception) {
            throw new UpdateDoValidationException($exception->getMessage(), previous: $exception);
        }

        $existing = $this->dos->findById($command->doId);
        if (null === $existing) {
            throw new UpdateDoNotFound(sprintf('DO not found for id %d.', $command->doId));
        }

        try {
            $updated = $this->merge($existing, $command);
        } catch (\InvalidArgumentException $exception) {
            throw new UpdateDoValidationException($exception->getMessage(), previous: $exception);
        }

        if (!$this->dos->update($updated)) {
            throw new UpdateDoNotFound(sprintf('DO not found for id %d.', $command->doId));
        }
    }

    private function validatePatchRequest(UpdateDoCommand $command): void
    {
        if ([] === array_filter($command->provided)) {
            throw new \InvalidArgumentException('At least one field is required to update.');
        }

        if ($command->isProvided('name') && (null === $command->name || '' === trim($command->name))) {
            throw new \InvalidArgumentException('name cannot be empty.');
        }

        if ($command->isProvided('region') && (null === $command->region || '' === trim($command->region))) {
            throw new \InvalidArgumentException('region cannot be empty.');
        }

        if ($command->isProvided('country') && null === $command->country) {
            throw new \InvalidArgumentException('country cannot be null.');
        }

        if ($command->isProvided('country_code')) {
            if (null === $command->countryCode || '' === trim($command->countryCode)) {
                throw new \InvalidArgumentException('country_code cannot be empty.');
            }

            if (2 !== strlen($command->countryCode)) {
                throw new \InvalidArgumentException('country_code must have 2 characters.');
            }
        }

        if ($command->isProvided('do_logo') && null !== $command->doLogo && '' === trim($command->doLogo)) {
            throw new \InvalidArgumentException('do_logo cannot be empty when provided.');
        }
        if ($command->isProvided('do_logo') && null !== $command->doLogo) {
            $this->photoInputGuard->assertImageFilename($command->doLogo, 'do_logo');
        }

        if ($command->isProvided('region_logo')) {
            throw new \InvalidArgumentException('region_logo cannot be updated via this endpoint.');
        }
    }

    private function merge(DenominationOfOrigin $existing, UpdateDoCommand $command): DenominationOfOrigin
    {
        return new DenominationOfOrigin(
            id: $existing->id,
            name: $command->isProvided('name') ? (string) $command->name : $existing->name,
            region: $command->isProvided('region') ? (string) $command->region : $existing->region,
            country: $command->isProvided('country') ? $command->country : $existing->country,
            countryCode: $command->isProvided('country_code') ? (string) $command->countryCode : $existing->countryCode,
            doLogo: $command->isProvided('do_logo') ? $command->doLogo : $existing->doLogo,
            regionLogo: $existing->regionLogo,
        );
    }
}
