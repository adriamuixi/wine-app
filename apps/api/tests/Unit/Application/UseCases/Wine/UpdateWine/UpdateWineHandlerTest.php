<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Wine\UpdateWine;

use App\Domain\Repository\DesignationOfOriginRepository;
use App\Domain\Repository\WineRepository;
use App\Application\UseCases\Wine\CreateWine\CreateWineCommand;
use App\Domain\Model\Wine;
use App\Application\UseCases\Wine\ListWines\ListWinesQuery;
use App\Application\UseCases\Wine\ListWines\ListWinesResult;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineCommand;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineHandler;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineNotFound;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineReferenceNotFound;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineValidationException;
use App\Domain\Enum\Country;
use App\Domain\Model\DesignationOfOrigin;
use PHPUnit\Framework\TestCase;

final class UpdateWineHandlerTest extends TestCase
{
    public function testItUpdatesExistingWine(): void
    {
        $repo = new SpyWineRepository(updatable: [10]);
        $handler = new UpdateWineHandler($repo, new InMemoryDesignationOfOriginRepository([2 => Country::Spain]));

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
        $handler = new UpdateWineHandler($repo, new InMemoryDesignationOfOriginRepository([]));

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
        $handler = new UpdateWineHandler($repo, new InMemoryDesignationOfOriginRepository([]));

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
        $handler = new UpdateWineHandler($repo, new InMemoryDesignationOfOriginRepository([]));

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

    public function create(CreateWineCommand $command, ?Country $country): int
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

    public function findById(int $id): ?Wine
    {
        return null;
    }

    public function findPaginated(ListWinesQuery $query): ListWinesResult
    {
        return new ListWinesResult([], $query->page, $query->limit, 0, 0);
    }
}

final class InMemoryDesignationOfOriginRepository implements DesignationOfOriginRepository
{
    /**
     * @param array<int,Country> $items
     */
    public function __construct(private readonly array $items)
    {
    }

    public function create(DesignationOfOrigin $do): int
    {
        return 0;
    }

    public function findCountryById(int $id): ?Country
    {
        return $this->items[$id] ?? null;
    }

    public function findById(int $id): ?DesignationOfOrigin
    {
        $country = $this->findCountryById($id);
        if (null === $country) {
            return null;
        }

        return new DesignationOfOrigin(
            id: $id,
            name: 'DO '.$id,
            region: 'Region '.$id,
            country: $country,
            countryCode: 'ES',
            doLogo: 'do_'.$id.'.png',
            regionLogo: 'region_'.$id.'.png',
        );
    }

    public function findAll(
        array $sortFields = [],
        ?string $name = null,
        ?Country $country = null,
        ?string $region = null,
        array $userIds = [],
    ): array
    {
        return [];
    }

    public function update(DesignationOfOrigin $do): bool
    {
        return false;
    }

    public function deleteById(int $id): bool
    {
        return false;
    }

    public function hasAssociatedWines(int $id): bool
    {
        return false;
    }
}
