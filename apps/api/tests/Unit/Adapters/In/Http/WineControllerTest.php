<?php

declare(strict_types=1);

namespace App\Tests\Unit\Adapters\In\Http;

use App\Adapters\In\Http\WineController;
use App\Application\Ports\AuthSessionManager;
use App\Application\Ports\PhotoStoragePort;
use App\Application\Ports\WineDraftGenerator;
use App\Domain\Repository\DesignationOfOriginRepository;
use App\Domain\Repository\GrapeRepository;
use App\Domain\Repository\WineRepository;
use App\Domain\Repository\WinePhotoRepository;
use App\Domain\Model\Award;
use App\Domain\Model\Place;
use App\Application\UseCases\Wine\CreateWine\CreateWineCommand;
use App\Application\UseCases\Wine\CreateWine\CreateWineHandler;
use App\Application\UseCases\Wine\DeleteWine\DeleteWineHandler;
use App\Application\UseCases\Wine\GenerateWineDraft\GenerateWineDraftCommand;
use App\Application\UseCases\Wine\GenerateWineDraft\GenerateWineDraftHandler;
use App\Application\UseCases\Wine\GetWine\GetWineDetailsHandler;
use App\Application\UseCases\Wine\ListWineRoute\ListWineRouteHandler;
use App\Application\UseCases\Wine\ListWineRoute\WineRouteStopView;
use App\Domain\Model\Wine;
use App\Domain\Model\DesignationOfOrigin;
use App\Domain\Model\WineGrape;
use App\Domain\Model\WinePhoto;
use App\Domain\Model\WinePurchase;
use App\Domain\Model\WineReview;
use App\Application\UseCases\Wine\ListWines\ListWinesHandler;
use App\Application\UseCases\Wine\ListWines\ListWinesQuery;
use App\Application\UseCases\Wine\ListWines\ListWinesResult;
use App\Application\UseCases\Wine\ListWines\WineListItemAwardView;
use App\Application\UseCases\Wine\ListWines\WineListItemGrapeView;
use App\Application\UseCases\Wine\ListWines\WineListItemPhotoView;
use App\Application\UseCases\Wine\ListWines\WineListItemReviewView;
use App\Application\UseCases\Wine\ListWines\WineListItemView;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineCommand;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineHandler;
use App\Domain\Enum\AgingType;
use App\Domain\Enum\AwardName;
use App\Domain\Enum\Country;
use App\Domain\Enum\GrapeColor;
use App\Domain\Enum\PlaceCountry;
use App\Domain\Enum\PlaceType;
use App\Domain\Enum\ReviewBullet;
use App\Domain\Enum\WineType;
use App\Domain\Enum\WinePhotoType;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

final class WineControllerTest extends TestCase
{
    public function testCreateReturnsBadRequestForInvalidJson(): void
    {
        $controller = $this->controller();
        $request = Request::create('/api/wines', 'POST', server: ['CONTENT_TYPE' => 'application/json'], content: '{');

        $response = $controller->create($request);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testRouteReturnsChronologicalPurchaseStops(): void
    {
        $controller = $this->controller();

        $response = $controller->route();
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertCount(2, $payload['items']);
        self::assertSame(501, $payload['items'][0]['purchase_id']);
        self::assertSame('2026-01-10T18:00:00+00:00', $payload['items'][0]['purchased_at']);
        self::assertSame('Vila Viniteca', $payload['items'][0]['place']['name']);
        self::assertSame('Ruta Wine 1', $payload['items'][0]['wine']['name']);
        self::assertSame(41.3851, $payload['items'][0]['place']['map_data']['lat']);
        self::assertSame(502, $payload['items'][1]['purchase_id']);
    }

    public function testDraftFromAiReturnsBadRequestWhenWineImageIsMissing(): void
    {
        $controller = $this->controller();
        $request = Request::create('/api/wines/draft-from-ai', 'POST');

        $response = $controller->draftFromAi($request);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testDraftFromAiReturnsStructuredDraft(): void
    {
        $controller = $this->controller(doCountries: [1 => Country::Spain], grapeIds: [5]);
        $tmp = tempnam(sys_get_temp_dir(), 'wine-ai-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, 'wine-image');
        $uploaded = new UploadedFile($tmp, 'wine.jpg', 'image/jpeg', null, true);
        $backTmp = tempnam(sys_get_temp_dir(), 'wine-ai-back-');
        self::assertNotFalse($backTmp);
        file_put_contents($backTmp, 'back-label-image');
        $backUploaded = new UploadedFile($backTmp, 'wine-back.jpg', 'image/jpeg', null, true);

        $request = Request::create('/api/wines/draft-from-ai', 'POST', [
            'notes' => 'Bought in Madrid',
            'place_type' => 'restaurant',
            'location_city' => 'Madrid',
        ], [], ['wine_image' => $uploaded, 'back_label_image' => $backUploaded]);

        $response = $controller->draftFromAi($request);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame('Wine AI Demo', $payload['draft']['wine']['name']);
        self::assertSame('red', $payload['draft']['wine']['wine_type']);
        self::assertSame('restaurant', $payload['draft']['purchase']['place_type']);
        self::assertSame(5, $payload['draft']['grapes'][0]['grape_id']);
        self::assertSame('internet', $payload['draft']['field_metadata']['wine.name']['source']);
    }

    public function testDraftFromAiAcceptsImageWhenOnlyExtensionCanBeUsed(): void
    {
        $controller = $this->controller(doCountries: [1 => Country::Spain], grapeIds: [5]);
        $tmp = tempnam(sys_get_temp_dir(), 'wine-ai-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, 'wine-image');
        $uploaded = new UploadedFile($tmp, 'wine.jpg', null, null, true);

        $request = Request::create('/api/wines/draft-from-ai', 'POST', [], [], ['wine_image' => $uploaded]);

        $response = $controller->draftFromAi($request);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
    }

    public function testCreateReturnsBadRequestWhenNameIsMissing(): void
    {
        $controller = $this->controller();
        $request = Request::create(
            '/api/wines',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['country' => 'spain'], JSON_THROW_ON_ERROR),
        );

        $response = $controller->create($request);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testCreateReturnsNotFoundWhenDoDoesNotExist(): void
    {
        $controller = $this->controller(doCountries: []);
        $request = Request::create(
            '/api/wines',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['name' => 'Mencia', 'do_id' => 999], JSON_THROW_ON_ERROR),
        );

        $response = $controller->create($request);

        self::assertSame(Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testCreateReturnsCreatedWithWineId(): void
    {
        $controller = $this->controller(doCountries: [1 => Country::Spain], grapeIds: [5]);
        $request = Request::create(
            '/api/wines',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'name' => 'Wine 1',
                'do_id' => 1,
                'alcohol_percentage' => 14.5,
                'grapes' => [
                    ['grape_id' => 5, 'percentage' => 100],
                ],
                'purchases' => [
                    [
                        'place' => [
                            'place_type' => 'restaurant',
                            'name' => 'Casa Paco',
                            'address' => 'Calle A',
                            'city' => 'Madrid',
                            'country' => 'spain',
                        ],
                        'price_paid' => '13.50',
                        'purchased_at' => '2026-02-28T09:00:00+00:00',
                    ],
                ],
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->create($request);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_CREATED, $response->getStatusCode());
        self::assertSame(333, $payload['wine']['id']);
    }

    public function testCreateAcceptsWineTableStylePayloadKeys(): void
    {
        $controller = $this->controller(doCountries: [1 => Country::Spain], grapeIds: [5]);
        $request = Request::create(
            '/api/wines',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'name' => 'Wine Alias',
                'do_id' => 1,
                'wine_grapes' => [
                    ['grape_id' => 5, 'percentage' => 100],
                ],
                'wine_purchase' => [
                    [
                        'place' => [
                            'place_type' => 'restaurant',
                            'name' => 'Casa Paco',
                            'address' => 'Calle A',
                            'city' => 'Madrid',
                            'country' => 'spain',
                        ],
                        'price_paid' => '13.50',
                        'purchased_at' => '2026-02-28T09:00:00+00:00',
                    ],
                ],
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->create($request);

        self::assertSame(Response::HTTP_CREATED, $response->getStatusCode());
    }

    public function testCreateAcceptsNullAddressAndCityForRestaurant(): void
    {
        $controller = $this->controller(doCountries: [1 => Country::Spain], grapeIds: [5]);
        $request = Request::create(
            '/api/wines',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'name' => 'Wine nullable place',
                'do_id' => 1,
                'purchases' => [
                    [
                        'place' => [
                            'place_type' => 'restaurant',
                            'name' => 'Casa Flexible',
                            'address' => null,
                            'city' => null,
                            'country' => 'spain',
                        ],
                        'price_paid' => '11.50',
                        'purchased_at' => '2026-03-01T10:00:00+00:00',
                    ],
                ],
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->create($request);

        self::assertSame(Response::HTTP_CREATED, $response->getStatusCode());
    }

    public function testCreateAcceptsPlaceMapData(): void
    {
        $controller = $this->controller(doCountries: [1 => Country::Spain], grapeIds: [5]);
        $request = Request::create(
            '/api/wines',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'name' => 'Wine with map data',
                'do_id' => 1,
                'purchases' => [
                    [
                        'place' => [
                            'place_type' => 'restaurant',
                            'name' => 'Casa Geo',
                            'address' => 'Calle A',
                            'city' => 'Madrid',
                            'country' => 'spain',
                            'map_data' => ['lat' => 40.4167, 'lng' => -3.70325],
                        ],
                        'price_paid' => '15.00',
                        'purchased_at' => '2026-03-01T10:00:00+00:00',
                    ],
                ],
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->create($request);

        self::assertSame(Response::HTTP_CREATED, $response->getStatusCode());
    }

    public function testCreateAcceptsWorldCountryForPurchasePlace(): void
    {
        $controller = $this->controller(doCountries: [1 => Country::Spain], grapeIds: [5]);
        $request = Request::create(
            '/api/wines',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'name' => 'Wine bought abroad',
                'do_id' => 1,
                'purchases' => [
                    [
                        'place' => [
                            'place_type' => 'restaurant',
                            'name' => 'Glenmoriston Town House Hotel',
                            'address' => 'Ness Bank 20, IV2 4SF',
                            'city' => 'Inverness',
                            'country' => 'united_kingdom',
                        ],
                        'price_paid' => '7.20',
                        'purchased_at' => '2026-03-01T10:00:00+00:00',
                    ],
                ],
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->create($request);

        self::assertSame(Response::HTTP_CREATED, $response->getStatusCode());
    }

    public function testCreateRejectsInvalidPlaceMapData(): void
    {
        $controller = $this->controller(doCountries: [1 => Country::Spain], grapeIds: [5]);
        $request = Request::create(
            '/api/wines',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'name' => 'Wine invalid map data',
                'do_id' => 1,
                'purchases' => [
                    [
                        'place' => [
                            'place_type' => 'restaurant',
                            'name' => 'Casa Geo',
                            'address' => 'Calle A',
                            'city' => 'Madrid',
                            'country' => 'spain',
                            'map_data' => ['lat' => 'foo', 'lng' => -3.70325],
                        ],
                        'price_paid' => '15.00',
                        'purchased_at' => '2026-03-01T10:00:00+00:00',
                    ],
                ],
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->create($request);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testListReturnsPaginatedWinesWithDefaults(): void
    {
        $controller = $this->controller();

        $request = Request::create('/api/wines', 'GET');
        $response = $controller->list($request);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame(1, $payload['pagination']['page']);
        self::assertSame(20, $payload['pagination']['limit']);
        self::assertSame('List Wine 1', $payload['items'][0]['name']);
        self::assertSame('crianza', $payload['items'][0]['aging_type']);
        self::assertSame('Tempranillo', $payload['items'][0]['grapes'][0]['name']);
        self::assertSame('parker', $payload['items'][0]['awards'][0]['name']);
        self::assertSame('bottle', $payload['items'][0]['photos'][0]['type']);
        self::assertSame('/images/wines/1/bottle.jpg', $payload['items'][0]['photos'][0]['url']);
        self::assertSame('front_label', $payload['items'][0]['photos'][1]['type']);
        self::assertNull($payload['items'][0]['photos'][1]['url']);
        self::assertSame(8, $payload['items'][0]['reviews'][0]['user_id']);
        self::assertSame('Ana', $payload['items'][0]['reviews'][0]['name']);
        self::assertSame('Lopez', $payload['items'][0]['reviews'][0]['lastname']);
        self::assertSame('2026-03-01T08:30:00+00:00', $payload['items'][0]['reviews'][0]['created_at']);
        self::assertSame(92, $payload['items'][0]['reviews'][0]['score']);
        self::assertSame(18.9, $payload['items'][0]['price_paid']);
        self::assertSame('2026-02-25T18:00:00+00:00', $payload['items'][0]['purchased_at']);
    }

    public function testListReturnsBadRequestForInvalidQueryParam(): void
    {
        $controller = $this->controller();

        $request = Request::create('/api/wines?page=0', 'GET');
        $response = $controller->list($request);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testListAcceptsExtendedFilterQueryParams(): void
    {
        $controller = $this->controller();

        $request = Request::create('/api/wines?search=rioja&wine_type=red&country=spain&do_id=2&grape_id=5&score_bucket=90_plus&sort_by=score&sort_dir=desc', 'GET');
        $response = $controller->list($request);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame('Rioja', $payload['items'][0]['do']['name']);
        self::assertSame('rioja_DO.png', $payload['items'][0]['do']['do_logo']);
        self::assertSame('la_rioja.png', $payload['items'][0]['do']['region_logo']);
        self::assertSame(91.5, $payload['items'][0]['avg_score']);
    }

    public function testDeleteReturnsNoContentWhenWineExists(): void
    {
        $controller = $this->controller(deletableWineIds: [33]);

        $response = $controller->delete(33);

        self::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());
    }

    public function testDeleteReturnsNotFoundWhenWineDoesNotExist(): void
    {
        $controller = $this->controller(deletableWineIds: []);

        $response = $controller->delete(999);

        self::assertSame(Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testUpdateReturnsNoContentWhenWineExists(): void
    {
        $controller = $this->controller(updatableWineIds: [20]);
        $request = Request::create(
            '/api/wines/20',
            'PUT',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['name' => 'Updated Name'], JSON_THROW_ON_ERROR),
        );

        $response = $controller->update(20, $request);

        self::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());
    }

    public function testUpdatePersistsGrapesPayloadInCommand(): void
    {
        $controller = $this->controller(updatableWineIds: [20]);
        $request = Request::create(
            '/api/wines/20',
            'PUT',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'name' => 'Updated Name',
                'grapes' => [
                    ['grape_id' => 5, 'percentage' => 70],
                    ['grape_id' => 8, 'percentage' => 30],
                ],
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->update(20, $request);

        self::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());
        self::assertNotNull(SpyWineRepository::$lastUpdateCommand);
        self::assertCount(2, SpyWineRepository::$lastUpdateCommand->grapes);
        self::assertSame(70.0, (float) SpyWineRepository::$lastUpdateCommand->grapes[0]->percentage);
        self::assertSame(30.0, (float) SpyWineRepository::$lastUpdateCommand->grapes[1]->percentage);
    }

    public function testUpdatePersistsAwardsPayloadInCommand(): void
    {
        $controller = $this->controller(updatableWineIds: [20]);
        $request = Request::create(
            '/api/wines/20',
            'PUT',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'name' => 'Updated Name',
                'awards' => [
                    ['name' => 'parker', 'score' => 96.5, 'year' => 2026],
                    ['name' => 'decanter', 'score' => null, 'year' => null, 'value' => 'gold'],
                ],
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->update(20, $request);

        self::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());
        self::assertNotNull(SpyWineRepository::$lastUpdateCommand);
        self::assertCount(2, SpyWineRepository::$lastUpdateCommand->awards);
        self::assertSame(AwardName::Parker, SpyWineRepository::$lastUpdateCommand->awards[0]->name);
        self::assertSame('96.5', SpyWineRepository::$lastUpdateCommand->awards[0]->score);
        self::assertSame(2026, SpyWineRepository::$lastUpdateCommand->awards[0]->year);
        self::assertSame(AwardName::Decanter, SpyWineRepository::$lastUpdateCommand->awards[1]->name);
        self::assertNull(SpyWineRepository::$lastUpdateCommand->awards[1]->score);
        self::assertNull(SpyWineRepository::$lastUpdateCommand->awards[1]->year);
        self::assertSame('gold', SpyWineRepository::$lastUpdateCommand->awards[1]->value);
    }

    public function testUpdatePersistsWineSpectatorYearOnlyInCommand(): void
    {
        $controller = $this->controller(updatableWineIds: [20]);
        $request = Request::create(
            '/api/wines/20',
            'PUT',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'name' => 'Updated Name',
                'awards' => [
                    ['name' => 'wine_spectator', 'score' => null, 'year' => 2025, 'value' => null],
                ],
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->update(20, $request);

        self::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());
        self::assertNotNull(SpyWineRepository::$lastUpdateCommand);
        self::assertCount(1, SpyWineRepository::$lastUpdateCommand->awards);
        self::assertSame(AwardName::WineSpectator, SpyWineRepository::$lastUpdateCommand->awards[0]->name);
        self::assertNull(SpyWineRepository::$lastUpdateCommand->awards[0]->score);
        self::assertSame(2025, SpyWineRepository::$lastUpdateCommand->awards[0]->year);
        self::assertNull(SpyWineRepository::$lastUpdateCommand->awards[0]->value);
    }

    public function testUpdateRejectsWineSpectatorScore(): void
    {
        $controller = $this->controller(updatableWineIds: [20]);
        $request = Request::create(
            '/api/wines/20',
            'PUT',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'name' => 'Updated Name',
                'awards' => [
                    ['name' => 'wine_spectator', 'score' => 95, 'year' => 2025],
                ],
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->update(20, $request);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        self::assertStringContainsString('awards[0].score must be null for wine_spectator.', (string) $response->getContent());
    }

    public function testUpdatePersistsPurchasesPayloadInCommand(): void
    {
        $controller = $this->controller(updatableWineIds: [20]);
        $request = Request::create(
            '/api/wines/20',
            'PUT',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'name' => 'Updated Name',
                'purchases' => [
                    [
                        'place' => [
                            'place_type' => 'supermarket',
                            'name' => 'Mercat Central',
                            'address' => 'Carrer Major 22',
                            'city' => 'Barcelona',
                            'country' => 'spain',
                            'map_data' => ['lat' => 41.3851, 'lng' => 2.1734],
                        ],
                        'price_paid' => '14.95',
                        'purchased_at' => '2026-03-15T10:00:00+00:00',
                    ],
                ],
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->update(20, $request);

        self::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());
        self::assertNotNull(SpyWineRepository::$lastUpdateCommand);
        self::assertCount(1, SpyWineRepository::$lastUpdateCommand->purchases);
        self::assertSame('Carrer Major 22', SpyWineRepository::$lastUpdateCommand->purchases[0]->place->address);
        self::assertSame('Barcelona', SpyWineRepository::$lastUpdateCommand->purchases[0]->place->city);
        self::assertSame(['lat' => 41.3851, 'lng' => 2.1734], SpyWineRepository::$lastUpdateCommand->purchases[0]->place->mapData);
        self::assertSame('14.95', SpyWineRepository::$lastUpdateCommand->purchases[0]->pricePaid);
    }

    public function testUpdateReturnsNotFoundWhenWineDoesNotExist(): void
    {
        $controller = $this->controller(updatableWineIds: []);
        $request = Request::create(
            '/api/wines/999',
            'PUT',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['name' => 'Updated Name'], JSON_THROW_ON_ERROR),
        );

        $response = $controller->update(999, $request);

        self::assertSame(Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testGetByIdReturnsNotFoundWhenWineDoesNotExist(): void
    {
        $controller = $this->controller(detailedWineIds: []);

        $response = $controller->getById(404);

        self::assertSame(Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testGetByIdReturnsWineWithNestedRelations(): void
    {
        $controller = $this->controller(detailedWineIds: [77]);

        $response = $controller->getById(77);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame(77, $payload['wine']['id']);
        self::assertSame('Tempranillo', $payload['wine']['grapes'][0]['name']);
        self::assertSame('front_label', $payload['wine']['photos'][0]['type']);
        self::assertSame('parker', $payload['wine']['awards'][0]['name']);
        self::assertArrayHasKey('value', $payload['wine']['awards'][0]);
        self::assertSame('fruity', $payload['wine']['reviews'][0]['bullets'][0]);
        self::assertSame('Madrid', $payload['wine']['purchases'][0]['place']['city']);
        self::assertSame(['lat' => 40.4167, 'lng' => -3.70325], $payload['wine']['purchases'][0]['place']['map_data']);
        self::assertSame('ribera', $payload['wine']['do']['name']);
        self::assertSame('ribera_del_duero_DO.png', $payload['wine']['do']['do_logo']);
        self::assertSame('castilla_y_leon.png', $payload['wine']['do']['region_logo']);
    }

    /**
     * @param array<int,Country> $doCountries
     * @param list<int> $grapeIds
     * @param list<int> $deletableWineIds
     * @param list<int> $updatableWineIds
     * @param list<int> $detailedWineIds
     */
    private function controller(
        array $doCountries = [],
        array $grapeIds = [],
        array $deletableWineIds = [],
        array $updatableWineIds = [],
        array $detailedWineIds = [],
    ): WineController
    {
        SpyWineRepository::$lastUpdateCommand = null;
        $repo = new SpyWineRepository($deletableWineIds, $updatableWineIds, $detailedWineIds);

        return new WineController(
            new AllowAllAuthSessionManager(),
            new CreateWineHandler(
                $repo,
                new InMemoryDesignationOfOriginRepository($doCountries),
                new InMemoryGrapeRepository($grapeIds),
            ),
            new UpdateWineHandler($repo, new InMemoryDesignationOfOriginRepository($doCountries)),
            new DeleteWineHandler($repo, new NoopWinePhotoRepository(), new NoopWinePhotoStorage()),
            new GenerateWineDraftHandler(
                new StubWineDraftGenerator(),
                new InMemoryDesignationOfOriginRepository($doCountries),
                new InMemoryGrapeRepository($grapeIds),
            ),
            new GetWineDetailsHandler($repo),
            new ListWinesHandler($repo),
            new ListWineRouteHandler($repo),
        );
    }
}

final class AllowAllAuthSessionManager implements AuthSessionManager
{
    public function loginByUserId(int $userId): void
    {
    }

    public function getAuthenticatedUserId(): ?int
    {
        return 1;
    }

    public function logout(): void
    {
    }
}

final class SpyWineRepository implements WineRepository
{
    public static ?UpdateWineCommand $lastUpdateCommand = null;
    /**
     * @param list<int> $deletableWineIds
     * @param list<int> $updatableWineIds
     * @param list<int> $detailedWineIds
     */
    public function __construct(
        private array $deletableWineIds = [],
        private array $updatableWineIds = [],
        private array $detailedWineIds = [],
    )
    {
    }

    public function create(CreateWineCommand $command, ?Country $country): int
    {
        return 333;
    }

    public function deleteById(int $id): bool
    {
        return in_array($id, $this->deletableWineIds, true);
    }

    public function updatePartial(UpdateWineCommand $command): bool
    {
        self::$lastUpdateCommand = $command;
        return in_array($command->wineId, $this->updatableWineIds, true);
    }

    public function existsById(int $id): bool
    {
        return in_array($id, $this->updatableWineIds, true) || in_array($id, $this->deletableWineIds, true);
    }

    public function findById(int $id): ?Wine
    {
        if (!in_array($id, $this->detailedWineIds, true)) {
            return null;
        }

        return new Wine(
            id: $id,
            name: 'Wine Full',
            winery: 'Bodega Demo',
            wineType: WineType::Red,
            do: new DesignationOfOrigin(1, 'ribera', 'Castilla y Leon', Country::Spain, 'ES', 'ribera_del_duero_DO.png', 'castilla_y_leon.png'),
            country: Country::Spain,
            agingType: AgingType::Reserve,
            vintageYear: 2020,
            alcoholPercentage: 14.5,
            createdAt: '2026-03-01T09:00:00+00:00',
            updatedAt: '2026-03-01T09:10:00+00:00',
            grapes: [new WineGrape(2, '90', 'Tempranillo', GrapeColor::Red)],
            purchases: [
                new WinePurchase(
                    new Place(PlaceType::Restaurant, 'Casa Paco', 'Calle A', 'Madrid', PlaceCountry::Spain, 11, ['lat' => 40.4167, 'lng' => -3.70325]),
                    '21.5',
                    new \DateTimeImmutable('2026-03-01T08:00:00+00:00'),
                    10,
                ),
            ],
            awards: [new Award(AwardName::Parker, '93.5', 2025, 3, null)],
            photos: [new WinePhoto(4, '/images/wines/77/front.jpg', WinePhotoType::FrontLabel, 'abc123', 12345, 'jpg')],
            reviews: [
                new WineReview(
                    userId: 8,
                    wineId: $id,
                    aroma: 4,
                    appearance: 2,
                    palateEntry: 3,
                    body: 4,
                    persistence: 5,
                    bullets: [ReviewBullet::Afrutado],
                    score: 92,
                    id: 5,
                    createdAt: new \DateTimeImmutable('2026-03-01T08:30:00+00:00'),
                    userName: 'Ana',
                    userLastname: 'Lopez',
                ),
            ],
        );
    }

    public function findPaginated(ListWinesQuery $query): ListWinesResult
    {
        return new ListWinesResult(
            items: [
                new WineListItemView(
                    id: 1,
                    name: 'List Wine 1',
                    winery: 'Bodega 1',
                    wineType: 'red',
                    agingType: 'crianza',
                    country: 'spain',
                    doId: 3,
                    doName: 'Rioja',
                    doLogo: 'rioja_DO.png',
                    regionLogo: 'la_rioja.png',
                    vintageYear: 2022,
                    avgScore: 91.5,
                    pricePaid: 18.9,
                    purchasedAt: '2026-02-25T18:00:00+00:00',
                    updatedAt: '2026-03-01T09:00:00+00:00',
                    grapes: [new WineListItemGrapeView(2, 'Tempranillo', 'red', 90.0)],
                    awards: [new WineListItemAwardView('parker', 93.5, 2025, null)],
                    photos: [
                        new WineListItemPhotoView('bottle', '/images/wines/1/bottle.jpg'),
                        new WineListItemPhotoView('front_label', null),
                        new WineListItemPhotoView('back_label', null),
                        new WineListItemPhotoView('situation', null),
                    ],
                    reviews: [
                        new WineListItemReviewView(8, 'Ana', 'Lopez', '2026-03-01T08:30:00+00:00', 92),
                        new WineListItemReviewView(2, 'Maria', 'Gascon', '2026-03-01T08:15:00+00:00', 88),
                    ],
                ),
            ],
            page: $query->page,
            limit: $query->limit,
            totalItems: 1,
            totalPages: 1,
        );
    }

    public function listRouteStops(): array
    {
        return [
            new WineRouteStopView(
                purchaseId: 501,
                purchasedAt: '2026-01-10T18:00:00+00:00',
                pricePaid: 21.5,
                wineId: 11,
                wineName: 'Ruta Wine 1',
                winery: 'Bodega Ruta',
                wineType: 'red',
                country: 'spain',
                doId: 3,
                doName: 'Rioja',
                doLogo: 'rioja_DO.png',
                regionLogo: 'la_rioja.png',
                placeId: 201,
                placeName: 'Vila Viniteca',
                placeAddress: 'Carrer dels Agullers 7',
                placeCity: 'Barcelona',
                placeCountry: 'spain',
                lat: 41.3851,
                lng: 2.1812,
            ),
            new WineRouteStopView(
                purchaseId: 502,
                purchasedAt: '2026-02-02T12:30:00+00:00',
                pricePaid: 18.9,
                wineId: 12,
                wineName: 'Ruta Wine 2',
                winery: 'Bodega Ruta Dos',
                wineType: 'white',
                country: 'spain',
                doId: null,
                doName: null,
                doLogo: null,
                regionLogo: null,
                placeId: 202,
                placeName: 'Celler de Gelida',
                placeAddress: null,
                placeCity: 'Barcelona',
                placeCountry: 'spain',
                lat: 41.3778,
                lng: 2.1514,
            ),
        ];
    }
}

final class NoopWinePhotoRepository implements WinePhotoRepository
{
    public function findByWineAndType(int $wineId, WinePhotoType $type): ?WinePhoto
    {
        return null;
    }

    public function create(
        int $wineId,
        WinePhoto $photo,
    ): int {
        return 1;
    }

    public function update(WinePhoto $photo): void
    {
    }

    public function findByWineId(int $wineId): array
    {
        if (1 === $wineId) {
            return [new WinePhoto(1, '/images/wines/1/bottle.jpg', WinePhotoType::Bottle, 'hash123', 1000, 'jpg')];
        }

        return [];
    }
}

final class NoopWinePhotoStorage implements PhotoStoragePort
{
    public function save(string $sourcePath, int $wineId, string $hash, string $extension): string
    {
        return '/images/wines/'.$wineId.'/'.$hash.'.'.$extension;
    }

    public function deleteByUrl(string $entity, string $url): void
    {
    }

    public function deleteDirectory(string $entity, int $wineId): void
    {
    }

}

final class InMemoryDesignationOfOriginRepository implements DesignationOfOriginRepository
{
    /**
     * @param array<int,Country> $countryByDoId
     */
    public function __construct(private readonly array $countryByDoId)
    {
    }

    public function create(DesignationOfOrigin $do): int
    {
        return 0;
    }

    public function findCountryById(int $id): ?Country
    {
        return $this->countryByDoId[$id] ?? null;
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
        ?bool $hasWines = null,
    ): array
    {
        $items = [];
        foreach ($this->countryByDoId as $id => $candidateCountry) {
            if (null !== $country && $candidateCountry !== $country) {
                continue;
            }

            $items[] = new DesignationOfOrigin(
                id: $id,
                name: 1 === $id ? 'Rioja' : 'DO '.$id,
                region: 1 === $id ? 'La Rioja' : 'Region '.$id,
                country: $candidateCountry,
                countryCode: 'ES',
                doLogo: 'do_'.$id.'.png',
                regionLogo: 'region_'.$id.'.png',
            );
        }

        return $items;
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

final class InMemoryGrapeRepository implements GrapeRepository
{
    /**
     * @param list<int> $existingIds
     */
    public function __construct(private readonly array $existingIds)
    {
    }

    public function findExistingIds(array $ids): array
    {
        return array_values(array_intersect($ids, $this->existingIds));
    }

    public function findAll(): array
    {
        $items = [];
        foreach ($this->existingIds as $id) {
            $items[] = new \App\Domain\Model\Grape($id, 5 === $id ? 'Tempranillo' : 'Grape '.$id, \App\Domain\Enum\GrapeColor::Red);
        }

        return $items;
    }
}

final class StubWineDraftGenerator implements WineDraftGenerator
{
    public function generate(GenerateWineDraftCommand $command): array
    {
        return [
            'wine' => [
                'name' => 'Wine AI Demo',
                'winery' => 'Bodega IA',
                'wine_type' => 'red',
                'country' => 'spain',
                'aging_type' => 'crianza',
                'vintage_year' => 2021,
                'alcohol_percentage' => 14.0,
                'do_name' => 'Rioja',
                'do_region' => 'La Rioja',
            ],
            'purchase' => [
                'place_type' => 'restaurant',
                'place_name' => 'Casa AI',
                'address' => 'Calle Demo 1',
                'city' => 'Madrid',
                'country' => 'spain',
                'price_paid' => 18.5,
                'purchased_at' => '2026-04-05',
                'map_data' => ['lat' => 40.4, 'lng' => -3.7],
            ],
            'grapes' => [
                ['name' => 'Tempranillo', 'percentage' => 100],
            ],
            'awards' => [
                ['name' => 'parker', 'score' => 92.0, 'year' => 2024],
            ],
            'field_metadata' => [
                'wine.name' => ['confidence' => 'high', 'source' => 'internet', 'notes' => null],
            ],
            'warnings' => ['review ticket date'],
            'research_summary' => 'Matched against winery and retailer pages.',
        ];
    }
}
