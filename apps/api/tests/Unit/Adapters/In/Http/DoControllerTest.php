<?php

declare(strict_types=1);

namespace App\Tests\Unit\Adapters\In\Http;

use App\Adapters\In\Http\DoController;
use App\Application\UseCases\Do\ListDos\ListDosHandler;
use App\Application\UseCases\Do\ListDos\ListDosSort;
use App\Domain\Enum\Country;
use App\Domain\Model\DenominationOfOrigin;
use App\Domain\Repository\DoRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

final class DoControllerTest extends TestCase
{
    public function testListReturnsDoItemsWithRegionAndCountry(): void
    {
        $repository = new DoControllerInMemoryDoRepository();
        $controller = new DoController(new ListDosHandler($repository));

        $response = $controller->list(Request::create('/api/dos', 'GET'));
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertCount(2, $payload['items']);
        self::assertSame('Rioja', $payload['items'][0]['name']);
        self::assertSame('La Rioja', $payload['items'][0]['region']);
        self::assertSame('spain', $payload['items'][0]['country']);
        self::assertSame('rioja_DO.png', $payload['items'][0]['do_logo']);
        self::assertSame('la_rioja.png', $payload['items'][0]['region_logo']);
        self::assertSame(ListDosSort::DEFAULT_ORDER, $repository->lastSortFields);
    }

    public function testListAcceptsCustomSortOrder(): void
    {
        $repository = new DoControllerInMemoryDoRepository();
        $controller = new DoController(new ListDosHandler($repository));

        $response = $controller->list(Request::create('/api/dos?sort_by_1=name&sort_by_2=country&sort_by_3=region', 'GET'));

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame(
            [ListDosSort::NAME, ListDosSort::COUNTRY, ListDosSort::REGION],
            $repository->lastSortFields,
        );
    }

    public function testListReturnsBadRequestForDuplicateSortField(): void
    {
        $controller = new DoController(new ListDosHandler(new DoControllerInMemoryDoRepository()));

        $response = $controller->list(Request::create('/api/dos?sort_by_1=country&sort_by_2=country', 'GET'));
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        self::assertSame('sort_by_2 contains duplicate sort field "country".', $payload['error']);
    }
}

final class DoControllerInMemoryDoRepository implements DoRepository
{
    /** @var list<string> */
    public array $lastSortFields = [];

    public function findById(int $id): ?DenominationOfOrigin
    {
        return null;
    }

    public function findCountryById(int $id): ?Country
    {
        return null;
    }

    public function findAll(array $sortFields = []): array
    {
        $this->lastSortFields = $sortFields;

        return [
            new DenominationOfOrigin(1, 'Rioja', 'La Rioja', Country::Spain, 'ES', 'rioja_DO.png', 'la_rioja.png'),
            new DenominationOfOrigin(2, 'Priorat', 'Catalunya', Country::Spain, 'ES', 'priorat_DO.png', 'cataluna.png'),
        ];
    }
}
