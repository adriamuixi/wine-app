<?php

declare(strict_types=1);

namespace App\Tests\Unit\Adapters\In\Http;

use App\Adapters\In\Http\DoController;
use App\Application\UseCases\Do\ListDos\ListDosHandler;
use App\Domain\Enum\Country;
use App\Domain\Model\DenominationOfOrigin;
use App\Domain\Repository\DoRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Response;

final class DoControllerTest extends TestCase
{
    public function testListReturnsDoItemsWithRegionAndCountry(): void
    {
        $controller = new DoController(new ListDosHandler(new DoControllerInMemoryDoRepository()));

        $response = $controller->list();
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertCount(2, $payload['items']);
        self::assertSame('Rioja', $payload['items'][0]['name']);
        self::assertSame('La Rioja', $payload['items'][0]['region']);
        self::assertSame('spain', $payload['items'][0]['country']);
    }
}

final class DoControllerInMemoryDoRepository implements DoRepository
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
            new DenominationOfOrigin(2, 'Priorat', 'Catalunya', Country::Spain, 'ES'),
        ];
    }
}

