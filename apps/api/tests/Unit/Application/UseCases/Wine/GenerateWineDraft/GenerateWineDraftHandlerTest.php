<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Wine\GenerateWineDraft;

use App\Application\Ports\WineDraftGenerator;
use App\Application\UseCases\Wine\GenerateWineDraft\GenerateWineDraftCommand;
use App\Application\UseCases\Wine\GenerateWineDraft\GenerateWineDraftHandler;
use App\Application\UseCases\Wine\GenerateWineDraft\GenerateWineDraftValidationException;
use App\Domain\Enum\Country;
use App\Domain\Enum\GrapeColor;
use App\Domain\Model\DesignationOfOrigin;
use App\Domain\Model\Grape;
use App\Domain\Repository\DesignationOfOriginRepository;
use App\Domain\Repository\GrapeRepository;
use PHPUnit\Framework\TestCase;

final class GenerateWineDraftHandlerTest extends TestCase
{
    public function testItNormalizesAiDraftAndMatchesKnownDoAndGrape(): void
    {
        $tmp = tempnam(sys_get_temp_dir(), 'wine-draft-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, 'image-bytes');

        $handler = new GenerateWineDraftHandler(
            new StubDraftGenerator([
                'wine' => [
                    'name' => 'AI Wine',
                    'winery' => 'Bodega IA',
                    'wine_type' => 'red',
                    'country' => 'spain',
                    'aging_type' => 'crianza',
                    'vintage_year' => 2020,
                    'alcohol_percentage' => 14.5,
                    'do_name' => 'Rioja',
                    'do_region' => 'La Rioja',
                ],
                'purchase' => [
                    'place_type' => 'restaurant',
                    'place_name' => 'Casa Demo',
                    'address' => 'Street 1',
                    'city' => 'Madrid',
                    'country' => 'spain',
                    'price_paid' => 14.95,
                    'purchased_at' => '2026-04-05',
                    'map_data' => ['lat' => 40.4, 'lng' => -3.7],
                ],
                'grapes' => [
                    ['name' => 'Tempranillo', 'percentage' => 90],
                ],
                'awards' => [
                    ['name' => 'parker', 'score' => 92, 'year' => 2024],
                ],
                'field_metadata' => [
                    'wine.name' => ['confidence' => 'high', 'source' => 'image', 'notes' => null],
                ],
                'warnings' => [],
                'research_summary' => 'ok',
            ]),
            new InMemoryDoRepo(),
            new InMemoryGrapeRepo(),
        );

        $result = $handler->handle(new GenerateWineDraftCommand(
            wineImage: [
                'sourcePath' => $tmp,
                'originalFilename' => 'wine.jpg',
                'mimeType' => 'image/jpeg',
                'size' => 10,
            ],
            backLabelImage: null,
            ticketImage: null,
            notes: null,
            priceOverride: null,
            placeType: null,
            location: null,
        ));

        self::assertSame('AI Wine', $result->wine['name']);
        self::assertSame(1, $result->wine['do']['id']);
        self::assertTrue($result->grapes[0]['matched']);
        self::assertSame(5, $result->grapes[0]['grape_id']);
        self::assertSame([], $result->missingRequiredFields);
    }

    public function testItFlagsUnsupportedEnumsAndUnknownMatches(): void
    {
        $tmp = tempnam(sys_get_temp_dir(), 'wine-draft-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, 'image-bytes');

        $handler = new GenerateWineDraftHandler(
            new StubDraftGenerator([
                'wine' => [
                    'name' => 'Mystery Wine',
                    'winery' => null,
                    'wine_type' => 'orange',
                    'country' => 'spain',
                    'aging_type' => null,
                    'vintage_year' => null,
                    'alcohol_percentage' => null,
                    'do_name' => 'Unknown',
                    'do_region' => null,
                ],
                'purchase' => [
                    'place_type' => 'market',
                    'place_name' => null,
                    'address' => null,
                    'city' => null,
                    'country' => 'spain',
                    'price_paid' => null,
                    'purchased_at' => null,
                    'map_data' => null,
                ],
                'grapes' => [
                    ['name' => 'Unknown Grape', 'percentage' => null],
                ],
                'awards' => [
                    ['name' => 'unknown_award', 'score' => null, 'year' => null],
                ],
                'field_metadata' => [],
                'warnings' => [],
                'research_summary' => null,
            ]),
            new InMemoryDoRepo(),
            new InMemoryGrapeRepo(),
        );

        $result = $handler->handle(new GenerateWineDraftCommand(
            wineImage: [
                'sourcePath' => $tmp,
                'originalFilename' => 'wine.jpg',
                'mimeType' => 'image/jpeg',
                'size' => 10,
            ],
            backLabelImage: null,
            ticketImage: null,
            notes: null,
            priceOverride: null,
            placeType: null,
            location: null,
        ));

        self::assertNull($result->wine['wine_type']);
        self::assertFalse($result->wine['do']['matched']);
        self::assertFalse($result->grapes[0]['matched']);
        self::assertSame(['purchase.place_name', 'purchase.price_paid', 'purchase.purchased_at'], $result->missingRequiredFields);
        self::assertNotSame([], $result->warnings);
    }

    public function testItRejectsNonImageInput(): void
    {
        $tmp = tempnam(sys_get_temp_dir(), 'wine-draft-');
        self::assertNotFalse($tmp);
        file_put_contents($tmp, 'image-bytes');

        $handler = new GenerateWineDraftHandler(
            new StubDraftGenerator([]),
            new InMemoryDoRepo(),
            new InMemoryGrapeRepo(),
        );

        $this->expectException(GenerateWineDraftValidationException::class);

        $handler->handle(new GenerateWineDraftCommand(
            wineImage: [
                'sourcePath' => $tmp,
                'originalFilename' => 'wine.txt',
                'mimeType' => 'text/plain',
                'size' => 10,
            ],
            backLabelImage: null,
            ticketImage: null,
            notes: null,
            priceOverride: null,
            placeType: null,
            location: null,
        ));
    }
}

final class StubDraftGenerator implements WineDraftGenerator
{
    /**
     * @param array<string,mixed> $payload
     */
    public function __construct(private readonly array $payload)
    {
    }

    public function generate(GenerateWineDraftCommand $command): array
    {
        return $this->payload;
    }
}

final class InMemoryDoRepo implements DesignationOfOriginRepository
{
    public function create(DesignationOfOrigin $do): int
    {
        return 0;
    }

    public function findById(int $id): ?DesignationOfOrigin
    {
        return 1 === $id ? new DesignationOfOrigin(1, 'Rioja', 'La Rioja', Country::Spain, 'ES') : null;
    }

    public function findCountryById(int $id): ?Country
    {
        return 1 === $id ? Country::Spain : null;
    }

    public function findAll(
        array $sortFields = [],
        ?string $name = null,
        ?Country $country = null,
        ?string $region = null,
        array $userIds = [],
    ): array {
        return [new DesignationOfOrigin(1, 'Rioja', 'La Rioja', Country::Spain, 'ES')];
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

final class InMemoryGrapeRepo implements GrapeRepository
{
    public function findExistingIds(array $ids): array
    {
        return array_values(array_intersect($ids, [5]));
    }

    public function findAll(): array
    {
        return [new Grape(5, 'Tempranillo', GrapeColor::Red)];
    }
}
