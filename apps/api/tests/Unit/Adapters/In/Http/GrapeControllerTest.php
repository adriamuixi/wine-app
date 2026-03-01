<?php

declare(strict_types=1);

namespace App\Tests\Unit\Adapters\In\Http;

use App\Adapters\In\Http\GrapeController;
use App\Application\UseCases\Grape\ListGrapes\ListGrapesHandler;
use App\Domain\Enum\GrapeColor;
use App\Domain\Model\Grape;
use App\Domain\Repository\GrapeRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Response;

final class GrapeControllerTest extends TestCase
{
    public function testListReturnsItemsForFilterDropdown(): void
    {
        $controller = new GrapeController(new ListGrapesHandler(new GrapeControllerInMemoryGrapeRepository()));

        $response = $controller->list();
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertCount(2, $payload['items']);
        self::assertSame('Tempranillo', $payload['items'][0]['name']);
        self::assertSame('red', $payload['items'][0]['color']);
    }
}

final class GrapeControllerInMemoryGrapeRepository implements GrapeRepository
{
    public function findExistingIds(array $ids): array
    {
        return $ids;
    }

    public function findAll(): array
    {
        return [
            new Grape(1, 'Tempranillo', GrapeColor::Red),
            new Grape(2, 'Syrah', GrapeColor::Red),
        ];
    }
}
