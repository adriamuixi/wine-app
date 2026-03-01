<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\CreateWine;

use App\Domain\Model\Wine;
use App\Domain\Model\Award;
use App\Domain\Model\WineGrape;
use App\Domain\Model\Place;
use App\Domain\Model\WinePurchase;
use App\Domain\Repository\DoRepository;
use App\Domain\Repository\GrapeRepository;
use App\Domain\Repository\WineRepository;
use App\Domain\Enum\Country;

final readonly class CreateWineHandler
{
    public function __construct(
        private WineRepository $wines,
        private DoRepository $dos,
        private GrapeRepository $grapes,
    ) {
    }

    public function handle(CreateWineCommand $command): CreateWineResult
    {
        try {
            $wine = new Wine(
                name: $command->name,
                winery: $command->winery,
                wineType: $command->wineType,
                country: $command->country,
                agingType: $command->agingType,
                vintageYear: $command->vintageYear,
                alcoholPercentage: $command->alcoholPercentage,
            );
            $this->validateBusinessRules($command);
            $resolvedCountry = $this->resolveCountry($command, $wine);
        } catch (\InvalidArgumentException $exception) {
            throw new CreateWineValidationException($exception->getMessage(), previous: $exception);
        }

        $grapeIds = array_map(static fn (CreateWineGrapeInput $item): int => $item->grapeId, $command->grapes);
        if (count($grapeIds) !== count(array_unique($grapeIds))) {
            throw new CreateWineValidationException('duplicate grape_id is not allowed.');
        }

        if ([] !== $grapeIds) {
            $existing = $this->grapes->findExistingIds($grapeIds);
            $missing = array_values(array_diff($grapeIds, $existing));
            if ([] !== $missing) {
                throw CreateWineReferenceNotFound::forIds('grape', $missing);
            }
        }

        $persistableCommand = new CreateWineCommand(
            name: $wine->name,
            winery: $wine->winery,
            wineType: $command->wineType,
            doId: $command->doId,
            country: $command->country,
            agingType: $command->agingType,
            vintageYear: $command->vintageYear,
            alcoholPercentage: $command->alcoholPercentage,
            grapes: $command->grapes,
            purchases: $command->purchases,
            awards: $command->awards,
        );

        return new CreateWineResult($this->wines->createWithRelations($persistableCommand, $resolvedCountry));
    }

    private function validateBusinessRules(CreateWineCommand $command): void
    {
        foreach ($command->grapes as $grape) {
            new WineGrape($grape->grapeId, $grape->percentage);
        }

        foreach ($command->purchases as $purchase) {
            $place = new Place(
                placeType: $purchase->place->placeType,
                name: $purchase->place->name,
                address: $purchase->place->address,
                city: $purchase->place->city,
                country: $purchase->place->country,
            );

            new WinePurchase(
                place: $place,
                pricePaid: $purchase->pricePaid,
                purchasedAt: $purchase->purchasedAt,
            );
        }

        foreach ($command->awards as $award) {
            new Award(
                name: $award->name,
                score: $award->score,
                year: $award->year,
            );
        }
    }

    private function resolveCountry(CreateWineCommand $command, Wine $wine): ?Country
    {
        if (null === $command->doId) {
            return $command->country;
        }

        $denomination = $this->dos->findById($command->doId);
        if (null === $denomination) {
            throw CreateWineReferenceNotFound::forIds('do', [$command->doId]);
        }

        $wine->assertCountryMatchesDo($denomination);

        return $command->country ?? $denomination->country;
    }
}
