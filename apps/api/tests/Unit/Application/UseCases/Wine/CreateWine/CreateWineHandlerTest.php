<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Wine\CreateWine;

use App\Domain\Repository\DoRepository;
use App\Domain\Repository\GrapeRepository;
use App\Domain\Repository\WineRepository;
use App\Application\UseCases\Wine\CreateWine\CreateWineAwardInput;
use App\Application\UseCases\Wine\CreateWine\CreateWineCommand;
use App\Application\UseCases\Wine\CreateWine\CreateWineGrapeInput;
use App\Application\UseCases\Wine\CreateWine\CreateWineHandler;
use App\Application\UseCases\Wine\CreateWine\CreateWinePlaceInput;
use App\Application\UseCases\Wine\CreateWine\CreateWinePurchaseInput;
use App\Application\UseCases\Wine\CreateWine\CreateWineReferenceNotFound;
use App\Application\UseCases\Wine\CreateWine\CreateWineValidationException;
use App\Domain\Model\Wine;
use App\Application\UseCases\Wine\ListWines\ListWinesQuery;
use App\Application\UseCases\Wine\ListWines\ListWinesResult;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineCommand;
use App\Domain\Enum\AwardName;
use App\Domain\Enum\Country;
use App\Domain\Model\DenominationOfOrigin;
use App\Domain\Enum\PlaceType;
use PHPUnit\Framework\TestCase;

final class CreateWineHandlerTest extends TestCase
{
    public function testItCreatesWineWithNameOnly(): void
    {
        $wineRepository = new SpyWineRepository();
        $handler = new CreateWineHandler(
            $wineRepository,
            new InMemoryDoRepository(),
            new InMemoryGrapeRepository(),
        );

        $result = $handler->handle($this->command(name: 'Mencia 2023'));

        self::assertSame(101, $result->id);
        self::assertSame('Mencia 2023', $wineRepository->lastCommand?->name);
        self::assertNull($wineRepository->lastCountry);
    }

    public function testItAcceptsDecimalAlcoholPercentage(): void
    {
        $wineRepository = new SpyWineRepository();
        $handler = new CreateWineHandler(
            $wineRepository,
            new InMemoryDoRepository(),
            new InMemoryGrapeRepository(),
        );

        $result = $handler->handle($this->command(alcoholPercentage: 14.5));

        self::assertSame(101, $result->id);
        self::assertSame(14.5, $wineRepository->lastCommand?->alcoholPercentage);
    }

    public function testItDerivesCountryFromDoWhenNotProvided(): void
    {
        $wineRepository = new SpyWineRepository();
        $handler = new CreateWineHandler(
            $wineRepository,
            new InMemoryDoRepository([9 => Country::Spain]),
            new InMemoryGrapeRepository([2]),
        );

        $result = $handler->handle($this->command(
            doId: 9,
            grapes: [new CreateWineGrapeInput(2, '40')],
            purchases: [new CreateWinePurchaseInput(
                new CreateWinePlaceInput(PlaceType::Restaurant, 'Casa Paco', 'Calle A', 'Madrid', Country::Spain),
                '19.99',
                new \DateTimeImmutable('2026-02-28T10:00:00+00:00'),
            )],
            awards: [new CreateWineAwardInput(AwardName::Parker, '91.5', 2025)],
        ));

        self::assertSame(101, $result->id);
        self::assertSame(Country::Spain, $wineRepository->lastCountry);
    }

    public function testItRejectsInvalidName(): void
    {
        $handler = new CreateWineHandler(
            new SpyWineRepository(),
            new InMemoryDoRepository(),
            new InMemoryGrapeRepository(),
        );

        $this->expectException(CreateWineValidationException::class);
        $handler->handle($this->command(name: '   '));
    }

    public function testItRejectsMissingGrapeIds(): void
    {
        $handler = new CreateWineHandler(
            new SpyWineRepository(),
            new InMemoryDoRepository(),
            new InMemoryGrapeRepository([1]),
        );

        $this->expectException(CreateWineReferenceNotFound::class);
        $handler->handle($this->command(grapes: [new CreateWineGrapeInput(3, null)]));
    }

    public function testItRejectsCountryThatDoesNotMatchDo(): void
    {
        $handler = new CreateWineHandler(
            new SpyWineRepository(),
            new InMemoryDoRepository([12 => Country::France]),
            new InMemoryGrapeRepository(),
        );

        $this->expectException(CreateWineValidationException::class);
        $handler->handle($this->command(doId: 12, country: Country::Spain));
    }

    public function testItRejectsSupermarketWithAddress(): void
    {
        $handler = new CreateWineHandler(
            new SpyWineRepository(),
            new InMemoryDoRepository(),
            new InMemoryGrapeRepository(),
        );

        $this->expectException(CreateWineValidationException::class);
        $handler->handle($this->command(
            purchases: [new CreateWinePurchaseInput(
                new CreateWinePlaceInput(PlaceType::Supermarket, 'Mercadona', 'Street 1', null, Country::Spain),
                '10.00',
                new \DateTimeImmutable('2026-02-28T10:00:00+00:00'),
            )],
        ));
    }

    public function testItAcceptsSupermarketWithCity(): void
    {
        $wineRepository = new SpyWineRepository();
        $handler = new CreateWineHandler(
            $wineRepository,
            new InMemoryDoRepository(),
            new InMemoryGrapeRepository(),
        );

        $result = $handler->handle($this->command(
            purchases: [new CreateWinePurchaseInput(
                new CreateWinePlaceInput(PlaceType::Supermarket, 'Mercadona', null, 'Madrid', Country::Spain),
                '10.00',
                new \DateTimeImmutable('2026-02-28T10:00:00+00:00'),
            )],
        ));

        self::assertSame(101, $result->id);
        self::assertSame('Madrid', $wineRepository->lastCommand?->purchases[0]->place->city);
    }

    /**
     * @param list<CreateWineGrapeInput> $grapes
     * @param list<CreateWinePurchaseInput> $purchases
     * @param list<CreateWineAwardInput> $awards
     */
    private function command(
        string $name = 'Wine',
        ?int $doId = null,
        ?Country $country = null,
        ?float $alcoholPercentage = null,
        array $grapes = [],
        array $purchases = [],
        array $awards = [],
    ): CreateWineCommand {
        return new CreateWineCommand(
            name: $name,
            winery: null,
            wineType: null,
            doId: $doId,
            country: $country,
            agingType: null,
            vintageYear: null,
            alcoholPercentage: $alcoholPercentage,
            grapes: $grapes,
            purchases: $purchases,
            awards: $awards,
        );
    }
}

final class SpyWineRepository implements WineRepository
{
    public ?CreateWineCommand $lastCommand = null;
    public ?Country $lastCountry = null;

    public function create(CreateWineCommand $command, ?Country $country): int
    {
        $this->lastCommand = $command;
        $this->lastCountry = $country;

        return 101;
    }

    public function deleteById(int $id): bool
    {
        return false;
    }

    public function updatePartial(UpdateWineCommand $command): bool
    {
        return false;
    }

    public function existsById(int $id): bool
    {
        return false;
    }

    public function findById(int $id): ?Wine
    {
        return null;
    }

    public function findPaginated(ListWinesQuery $query): ListWinesResult
    {
        return new ListWinesResult([], $query->page, $query->limit, 0, 0);
    }
}

final class InMemoryDoRepository implements DoRepository
{
    /**
     * @param array<int,Country> $countryByDoId
     */
    public function __construct(private readonly array $countryByDoId = [])
    {
    }

    public function findCountryById(int $id): ?Country
    {
        return $this->countryByDoId[$id] ?? null;
    }

    public function findById(int $id): ?DenominationOfOrigin
    {
        $country = $this->findCountryById($id);
        if (null === $country) {
            return null;
        }

        return new DenominationOfOrigin(
            id: $id,
            name: 'DO '.$id,
            region: 'Region '.$id,
            country: $country,
            countryCode: 'ES',
        );
    }

    public function findAll(): array
    {
        return [];
    }
}

final class InMemoryGrapeRepository implements GrapeRepository
{
    /**
     * @param list<int> $existingIds
     */
    public function __construct(private readonly array $existingIds = [])
    {
    }

    public function findExistingIds(array $ids): array
    {
        return array_values(array_intersect($ids, $this->existingIds));
    }

    public function findAll(): array
    {
        return [];
    }
}
