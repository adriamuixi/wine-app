<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Wine\UpdateWine;

use App\Domain\Repository\DoRepository;
use App\Domain\Repository\WineRepository;
use App\Application\UseCases\Wine\CreateWine\CreateWineCommand;
use App\Application\UseCases\Wine\GetWine\WineDetailsView;
use App\Application\UseCases\Wine\ListWines\ListWinesQuery;
use App\Application\UseCases\Wine\ListWines\ListWinesResult;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineCommand;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineHandler;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineNotFound;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineReferenceNotFound;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineValidationException;
use App\Domain\Enum\Country;
use App\Domain\Model\DenominationOfOrigin;
use PHPUnit\Framework\TestCase;

final class UpdateWineHandlerTest extends TestCase
{
    public function testItUpdatesExistingWine(): void
    {
        $repo = new SpyWineRepository(updatable: [10]);
        $handler = new UpdateWineHandler($repo, new InMemoryDoRepository([2 => Country::Spain]));

        $handler->handle(new UpdateWineCommand(
            wineId: 10,
            name: 'Updated',
            winery: null,
            wineType: null,
            doId: 2,
            country: null,
            agingType: null,
            vintageYear: null,
            alcoholPercentage: 14.5,
            provided: ['name' => true, 'do_id' => true, 'alcohol_percentage' => true],
        ));

        self::assertSame(10, $repo->lastCommand?->wineId);
        self::assertSame(Country::Spain, $repo->lastCommand?->country);
    }

    public function testItRejectsInvalidDoId(): void
    {
        $repo = new SpyWineRepository(updatable: [10]);
        $handler = new UpdateWineHandler($repo, new InMemoryDoRepository([]));

        $this->expectException(UpdateWineReferenceNotFound::class);
        $handler->handle(new UpdateWineCommand(
            wineId: 10,
            name: null,
            winery: null,
            wineType: null,
            doId: 999,
            country: null,
            agingType: null,
            vintageYear: null,
            alcoholPercentage: null,
            provided: ['do_id' => true],
        ));
    }

    public function testItRejectsWhenNoFieldsProvided(): void
    {
        $repo = new SpyWineRepository(updatable: [10]);
        $handler = new UpdateWineHandler($repo, new InMemoryDoRepository([]));

        $this->expectException(UpdateWineValidationException::class);
        $handler->handle(new UpdateWineCommand(
            wineId: 10,
            name: null,
            winery: null,
            wineType: null,
            doId: null,
            country: null,
            agingType: null,
            vintageYear: null,
            alcoholPercentage: null,
            provided: [],
        ));
    }

    public function testItThrowsNotFoundWhenWineDoesNotExist(): void
    {
        $repo = new SpyWineRepository(updatable: []);
        $handler = new UpdateWineHandler($repo, new InMemoryDoRepository([]));

        $this->expectException(UpdateWineNotFound::class);
        $handler->handle(new UpdateWineCommand(
            wineId: 77,
            name: 'Updated',
            winery: null,
            wineType: null,
            doId: null,
            country: null,
            agingType: null,
            vintageYear: null,
            alcoholPercentage: null,
            provided: ['name' => true],
        ));
    }
}

final class SpyWineRepository implements WineRepository
{
    public ?UpdateWineCommand $lastCommand = null;

    /**
     * @param list<int> $updatable
     */
    public function __construct(private readonly array $updatable)
    {
    }

    public function createWithRelations(CreateWineCommand $command, ?Country $country): int
    {
        return 1;
    }

    public function updatePartial(UpdateWineCommand $command): bool
    {
        $this->lastCommand = $command;

        return in_array($command->wineId, $this->updatable, true);
    }

    public function deleteById(int $id): bool
    {
        return false;
    }

    public function existsById(int $id): bool
    {
        return in_array($id, $this->updatable, true);
    }

    public function findDetailsById(int $id): ?WineDetailsView
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
     * @param array<int,Country> $items
     */
    public function __construct(private readonly array $items)
    {
    }

    public function findCountryById(int $id): ?Country
    {
        return $this->items[$id] ?? null;
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
}
