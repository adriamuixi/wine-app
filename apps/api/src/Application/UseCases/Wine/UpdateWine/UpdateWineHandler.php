<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\UpdateWine;

use App\Domain\Model\Wine;
use App\Domain\Model\WineGrape;
use App\Domain\Repository\DoRepository;
use App\Domain\Repository\WineRepository;

final readonly class UpdateWineHandler
{
    public function __construct(
        private WineRepository $wines,
        private DoRepository $dos,
    ) {
    }

    public function handle(UpdateWineCommand $command): void
    {
        try {
            $this->validatePatchRequest($command);
        } catch (\InvalidArgumentException $exception) {
            throw new UpdateWineValidationException($exception->getMessage(), previous: $exception);
        }

        $normalized = $this->normalizeCountryWithDo($command);

        if (!$this->wines->updatePartial($normalized)) {
            throw new UpdateWineNotFound(sprintf('Wine not found for id %d.', $command->wineId));
        }
    }

    private function normalizeCountryWithDo(UpdateWineCommand $command): UpdateWineCommand
    {
        if (!$command->isProvided('do_id')) {
            return $command;
        }

        if (null === $command->doId) {
            return $command;
        }

        $denomination = $this->dos->findById($command->doId);
        if (null === $denomination) {
            throw UpdateWineReferenceNotFound::forIds('do', [$command->doId]);
        }
        $doCountry = $denomination->country;

        if ($command->isProvided('country')) {
            if (null === $command->country) {
                throw new UpdateWineValidationException('country cannot be null when do_id is provided.');
            }

            if ($command->country !== $doCountry) {
                throw new UpdateWineValidationException('country must match do country when do_id is provided.');
            }

            return $command;
        }

        $provided = $command->provided;
        $provided['country'] = true;

        return new UpdateWineCommand(
            wineId: $command->wineId,
            name: $command->name,
            winery: $command->winery,
            wineType: $command->wineType,
            doId: $command->doId,
            country: $doCountry,
            agingType: $command->agingType,
            vintageYear: $command->vintageYear,
            alcoholPercentage: $command->alcoholPercentage,
            provided: $provided,
            grapes: $command->grapes,
        );
    }

    private function validatePatchRequest(UpdateWineCommand $command): void
    {
        if ([] === array_filter($command->provided)) {
            throw new \InvalidArgumentException('At least one field is required to update.');
        }

        if ($command->isProvided('name') && (null === $command->name || '' === trim($command->name))) {
            throw new \InvalidArgumentException('name cannot be empty.');
        }

        if ($command->isProvided('vintage_year')) {
            Wine::assertVintageYear($command->vintageYear);
        }

        if ($command->isProvided('alcohol_percentage')) {
            Wine::assertAlcoholPercentage($command->alcoholPercentage);
        }

        if ($command->isProvided('grapes')) {
            foreach ($command->grapes as $grape) {
                new WineGrape($grape->grapeId, $grape->percentage);
            }
        }
    }
}
