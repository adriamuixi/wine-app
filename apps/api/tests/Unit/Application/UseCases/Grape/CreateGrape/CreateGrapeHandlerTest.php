<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Grape\CreateGrape;

use App\Application\UseCases\Grape\CreateGrape\CreateGrapeCommand;
use App\Application\UseCases\Grape\CreateGrape\CreateGrapeHandler;
use App\Application\UseCases\Grape\CreateGrape\CreateGrapeValidationException;
use App\Domain\Enum\GrapeColor;
use App\Domain\Model\Grape;
use App\Domain\Repository\GrapeRepository;
use PHPUnit\Framework\TestCase;

final class CreateGrapeHandlerTest extends TestCase
{
    public function testItCreatesGrapeAndReturnsId(): void
    {
        $repository = new SpyCreateGrapeRepository();
        $handler = new CreateGrapeHandler($repository);

        $result = $handler->handle(new CreateGrapeCommand('Garnacha', GrapeColor::Red));

        self::assertSame(77, $result->id);
        self::assertSame('Garnacha', $repository->createdGrape?->name);
        self::assertSame(GrapeColor::Red, $repository->createdGrape?->color);
    }

    public function testItRejectsEmptyName(): void
    {
        $handler = new CreateGrapeHandler(new SpyCreateGrapeRepository());

        $this->expectException(CreateGrapeValidationException::class);
        $this->expectExceptionMessage('name is required.');

        $handler->handle(new CreateGrapeCommand('   ', GrapeColor::White));
    }
}

final class SpyCreateGrapeRepository implements GrapeRepository
{
    public ?Grape $createdGrape = null;

    public function findExistingIds(array $ids): array
    {
        return $ids;
    }

    public function create(Grape $grape): int
    {
        $this->createdGrape = $grape;

        return 77;
    }

    public function findById(int $id): ?Grape
    {
        return null;
    }

    public function findAll(array $sortFields = [], ?string $name = null, ?GrapeColor $color = null): array
    {
        return [];
    }

    public function update(Grape $grape): bool
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

