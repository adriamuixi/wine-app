<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Do\ListDos;

use App\Application\UseCases\Do\ListDos\ListDosHandler;
use App\Domain\Enum\Country;
use App\Domain\Model\DenominationOfOrigin;
use App\Domain\Repository\DoRepository;
use PHPUnit\Framework\TestCase;

final class ListDosHandlerTest extends TestCase
{
    public function testItReturnsAllDosFromRepository(): void
    {
        $handler = new ListDosHandler(new InMemoryDoRepository());
        $items = $handler->handle();

        self::assertCount(2, $items);
        self::assertSame('Rioja', $items[0]->name);
        self::assertSame('La Rioja', $items[0]->region);
        self::assertSame(Country::Spain, $items[0]->country);
    }
}

final class InMemoryDoRepository implements DoRepository
{
    public function findById(int $id): ?DenominationOfOrigin
    {
        return null;
    }

    public function findCountryById(int $id): ?Country
    {
        return null;
    }

    public function findAll(): array
    {
        return [
            new DenominationOfOrigin(1, 'Rioja', 'La Rioja', Country::Spain, 'ES'),
            new DenominationOfOrigin(2, 'Bordeaux', 'Bordeaux', Country::France, 'FR'),
        ];
    }
}

