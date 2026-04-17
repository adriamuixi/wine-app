<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Grape\UpdateGrape;

use App\Application\UseCases\Grape\UpdateGrape\UpdateGrapeCommand;
use App\Application\UseCases\Grape\UpdateGrape\UpdateGrapeHandler;
use App\Application\UseCases\Grape\UpdateGrape\UpdateGrapeNotFound;
use App\Application\UseCases\Grape\UpdateGrape\UpdateGrapeValidationException;
use App\Domain\Enum\GrapeColor;
use App\Domain\Model\Grape;
use App\Domain\Repository\GrapeRepository;
use PHPUnit\Framework\TestCase;

final class UpdateGrapeHandlerTest extends TestCase
{
    public function testItUpdatesExistingGrape(): void
    {
        $repository = new SpyUpdateGrapeRepository([10]);
        $handler = new UpdateGrapeHandler($repository);

        $handler->handle(new UpdateGrapeCommand(
            grapeId: 10,
            name: 'Updated Grape',
            color: null,
            provided: ['name' => true],
        ));

        self::assertSame(10, $repository->lastGrape?->id);
        self::assertSame('Updated Grape', $repository->lastGrape?->name);
        self::assertSame(GrapeColor::Red, $repository->lastGrape?->color);
    }

    public function testItRejectsWhenNoFieldsProvided(): void
    {
        $handler = new UpdateGrapeHandler(new SpyUpdateGrapeRepository([10]));

        $this->expectException(UpdateGrapeValidationException::class);
        $this->expectExceptionMessage('At least one field is required to update.');

        $handler->handle(new UpdateGrapeCommand(
            grapeId: 10,
            name: null,
            color: null,
            provided: [],
        ));
    }

    public function testItThrowsNotFoundWhenMissing(): void
    {
        $handler = new UpdateGrapeHandler(new SpyUpdateGrapeRepository([]));

        $this->expectException(UpdateGrapeNotFound::class);

        $handler->handle(new UpdateGrapeCommand(
            grapeId: 77,
            name: 'Updated',
            color: null,
            provided: ['name' => true],
        ));
    }
}

final class SpyUpdateGrapeRepository implements GrapeRepository
{
    public ?Grape $lastGrape = null;

    /**
     * @param list<int> $updatableIds
     */
    public function __construct(private readonly array $updatableIds)
    {
    }

    public function findExistingIds(array $ids): array
    {
        return $ids;
    }

    public function create(Grape $grape): int
    {
        return 0;
    }

    public function findById(int $id): ?Grape
    {
        if (!in_array($id, $this->updatableIds, true)) {
            return null;
        }

        return new Grape($id, 'Grape '.$id, GrapeColor::Red);
    }

    public function findAll(array $sortFields = [], ?string $name = null, ?GrapeColor $color = null): array
    {
        return [];
    }

    public function update(Grape $grape): bool
    {
        $this->lastGrape = $grape;

        return in_array($grape->id, $this->updatableIds, true);
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

