<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Grape\ListGrapes;

use App\Application\UseCases\Grape\ListGrapes\ListGrapesHandler;
use App\Domain\Enum\GrapeColor;
use App\Domain\Model\Grape;
use App\Domain\Repository\GrapeRepository;
use PHPUnit\Framework\TestCase;

final class ListGrapesHandlerTest extends TestCase
{
    public function testItReturnsFilterItemsFromRepository(): void
    {
        $handler = new ListGrapesHandler(new InMemoryGrapeRepository());
        $items = $handler->handle();

        self::assertCount(2, $items);
        self::assertSame('Garnatxa', $items[0]->name);
        self::assertSame(GrapeColor::Red, $items[0]->color);
    }
}

final class InMemoryGrapeRepository implements GrapeRepository
{
    public function findExistingIds(array $ids): array
    {
        return $ids;
    }

    public function findAll(): array
    {
        return [
            new Grape(1, 'Garnatxa', GrapeColor::Red),
            new Grape(2, 'Albariño', GrapeColor::White),
        ];
    }
}
