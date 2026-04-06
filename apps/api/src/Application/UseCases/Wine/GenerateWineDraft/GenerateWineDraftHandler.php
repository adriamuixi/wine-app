<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\GenerateWineDraft;

use App\Application\Ports\WineDraftGenerator;
use App\Domain\Enum\AgingType;
use App\Domain\Enum\AwardName;
use App\Domain\Enum\Country;
use App\Domain\Enum\PlaceType;
use App\Domain\Enum\WineType;
use App\Domain\Repository\DesignationOfOriginRepository;
use App\Domain\Repository\GrapeRepository;

final readonly class GenerateWineDraftHandler
{
    public function __construct(
        private WineDraftGenerator $generator,
        private DesignationOfOriginRepository $dos,
        private GrapeRepository $grapes,
    ) {
    }

    public function handle(GenerateWineDraftCommand $command): GenerateWineDraftResult
    {
        $this->validateCommand($command);

        $raw = $this->generator->generate($command);

        $warnings = $this->normalizeWarnings($raw['warnings'] ?? []);
        $fieldMetadata = $this->normalizeFieldMetadata($raw['field_metadata'] ?? []);
        $wine = $this->normalizeWine($raw['wine'] ?? [], $warnings);
        $purchase = $this->normalizePurchase($raw['purchase'] ?? [], $command, $warnings);
        $grapes = $this->normalizeGrapes($raw['grapes'] ?? [], $warnings);
        $awards = $this->normalizeAwards($raw['awards'] ?? [], $warnings);
        $missingRequiredFields = $this->computeMissingRequiredFields($wine, $purchase);
        $researchSummary = $this->normalizeNullableString($raw['research_summary'] ?? null);

        return new GenerateWineDraftResult(
            wine: $wine,
            purchase: $purchase,
            grapes: $grapes,
            awards: $awards,
            fieldMetadata: $fieldMetadata,
            warnings: array_values(array_unique($warnings)),
            missingRequiredFields: $missingRequiredFields,
            researchSummary: $researchSummary,
        );
    }

    private function validateCommand(GenerateWineDraftCommand $command): void
    {
        $this->assertImagePayload($command->wineImage, 'wine_image');

        if (null !== $command->ticketImage) {
            $this->assertImagePayload($command->ticketImage, 'ticket_image');
        }

        if (null !== $command->priceOverride && !is_numeric($command->priceOverride)) {
            throw new GenerateWineDraftValidationException('price_override must be numeric when provided.');
        }

        if (null !== $command->placeType && null === PlaceType::tryFrom($command->placeType)) {
            throw new GenerateWineDraftValidationException('Invalid place_type value.');
        }
    }

    /**
     * @param array{sourcePath: string, originalFilename: string, mimeType: string, size: int} $image
     */
    private function assertImagePayload(array $image, string $field): void
    {
        if ('' === trim($image['sourcePath'])) {
            throw new GenerateWineDraftValidationException(sprintf('%s source path is required.', $field));
        }

        if (!is_file($image['sourcePath'])) {
            throw new GenerateWineDraftValidationException(sprintf('%s file does not exist.', $field));
        }

        if ($image['size'] <= 0) {
            throw new GenerateWineDraftValidationException(sprintf('%s file is empty.', $field));
        }

        if (!str_starts_with($image['mimeType'], 'image/')) {
            throw new GenerateWineDraftValidationException(sprintf('%s must be an image.', $field));
        }
    }

    /**
     * @param mixed $value
     *
     * @return list<string>
     */
    private function normalizeWarnings(mixed $value): array
    {
        if (!is_array($value)) {
            return [];
        }

        $warnings = [];
        foreach ($value as $item) {
            if (is_string($item) && '' !== trim($item)) {
                $warnings[] = trim($item);
            }
        }

        return $warnings;
    }

    /**
     * @param mixed $value
     *
     * @return array<string,array{confidence: string, source: string, notes: ?string}>
     */
    private function normalizeFieldMetadata(mixed $value): array
    {
        if (!is_array($value)) {
            return [];
        }

        $result = [];
        foreach ($value as $field => $metadata) {
            if (!is_string($field) || !is_array($metadata)) {
                continue;
            }

            $confidence = $this->normalizeConfidence($metadata['confidence'] ?? null);
            $source = $this->normalizeSource($metadata['source'] ?? null);
            $notes = $this->normalizeNullableString($metadata['notes'] ?? null);

            $result[$field] = [
                'confidence' => $confidence,
                'source' => $source,
                'notes' => $notes,
            ];
        }

        return $result;
    }

    /**
     * @param mixed $value
     * @param list<string> $warnings
     *
     * @return array<string,mixed>
     */
    private function normalizeWine(mixed $value, array &$warnings): array
    {
        if (!is_array($value)) {
            return [
                'name' => null,
                'winery' => null,
                'wine_type' => null,
                'country' => null,
                'aging_type' => null,
                'vintage_year' => null,
                'alcohol_percentage' => null,
                'do' => null,
            ];
        }

        $country = $this->normalizeCountry($value['country'] ?? null);
        $do = $this->resolveDo(
            name: $this->normalizeNullableString($value['do_name'] ?? null),
            region: $this->normalizeNullableString($value['do_region'] ?? null),
            country: $country,
            warnings: $warnings,
        );

        return [
            'name' => $this->normalizeNullableString($value['name'] ?? null),
            'winery' => $this->normalizeNullableString($value['winery'] ?? null),
            'wine_type' => $this->normalizeEnumString($value['wine_type'] ?? null, WineType::class, 'wine_type', $warnings),
            'country' => $country,
            'aging_type' => $this->normalizeEnumString($value['aging_type'] ?? null, AgingType::class, 'aging_type', $warnings),
            'vintage_year' => $this->normalizeInt($value['vintage_year'] ?? null),
            'alcohol_percentage' => $this->normalizeFloat($value['alcohol_percentage'] ?? null),
            'do' => $do,
        ];
    }

    /**
     * @param mixed $value
     * @param list<string> $warnings
     *
     * @return array<string,mixed>
     */
    private function normalizePurchase(mixed $value, GenerateWineDraftCommand $command, array &$warnings): array
    {
        $input = is_array($value) ? $value : [];
        $location = $command->location ?? [];
        $price = null !== $command->priceOverride ? (float) $command->priceOverride : $this->normalizeFloat($input['price_paid'] ?? null);

        return [
            'place_type' => $command->placeType ?? $this->normalizeEnumString($input['place_type'] ?? null, PlaceType::class, 'place_type', $warnings),
            'place_name' => $this->normalizeNullableString($input['place_name'] ?? $location['name'] ?? null),
            'address' => $this->normalizeNullableString($input['address'] ?? $location['address'] ?? null),
            'city' => $this->normalizeNullableString($input['city'] ?? $location['city'] ?? null),
            'country' => $this->normalizeCountry($input['country'] ?? $location['country'] ?? null),
            'map_data' => $this->normalizeMapData(
                $input['map_data'] ?? [
                    'lat' => $location['latitude'] ?? null,
                    'lng' => $location['longitude'] ?? null,
                ],
            ),
            'price_paid' => $price,
            'purchased_at' => $this->normalizeNullableString($input['purchased_at'] ?? null),
        ];
    }

    /**
     * @param mixed $value
     * @param list<string> $warnings
     *
     * @return list<array<string,mixed>>
     */
    private function normalizeGrapes(mixed $value, array &$warnings): array
    {
        if (!is_array($value)) {
            return [];
        }

        $available = $this->grapes->findAll();
        $result = [];
        foreach ($value as $item) {
            if (!is_array($item)) {
                continue;
            }

            $name = $this->normalizeNullableString($item['name'] ?? null);
            if (null === $name) {
                continue;
            }

            $matchedId = null;
            foreach ($available as $grape) {
                if ($this->normalizeToken($grape->name) === $this->normalizeToken($name)) {
                    $matchedId = $grape->id;
                    $name = $grape->name;
                    break;
                }
            }

            if (null === $matchedId) {
                $warnings[] = sprintf('Could not safely match grape "%s" to an existing grape id.', $name);
            }

            $result[] = [
                'grape_id' => $matchedId,
                'name' => $name,
                'percentage' => $this->normalizeFloat($item['percentage'] ?? null),
                'matched' => null !== $matchedId,
            ];
        }

        return $result;
    }

    /**
     * @param mixed $value
     * @param list<string> $warnings
     *
     * @return list<array<string,mixed>>
     */
    private function normalizeAwards(mixed $value, array &$warnings): array
    {
        if (!is_array($value)) {
            return [];
        }

        $result = [];
        foreach ($value as $item) {
            if (!is_array($item)) {
                continue;
            }

            $name = $this->normalizeAwardName($item['name'] ?? null, $warnings);
            if (null === $name) {
                continue;
            }

            $result[] = [
                'name' => $name,
                'score' => $this->normalizeFloat($item['score'] ?? null),
                'year' => $this->normalizeInt($item['year'] ?? null),
            ];
        }

        return $result;
    }

    /**
     * @param list<string> $warnings
     *
     * @return array{id: ?int, name: string, region: ?string, country: ?string, matched: bool}|null
     */
    private function resolveDo(?string $name, ?string $region, ?string $country, array &$warnings): ?array
    {
        if (null === $name) {
            return null;
        }

        $countryEnum = null === $country ? null : Country::tryFrom($country);
        $candidates = $this->dos->findAll(country: $countryEnum);
        foreach ($candidates as $candidate) {
            if ($this->normalizeToken($candidate->name) !== $this->normalizeToken($name)) {
                continue;
            }

            if (null !== $region && $this->normalizeToken($candidate->region) !== $this->normalizeToken($region)) {
                continue;
            }

            return [
                'id' => $candidate->id,
                'name' => $candidate->name,
                'region' => $candidate->region,
                'country' => $candidate->country->value,
                'matched' => true,
            ];
        }

        $warnings[] = sprintf('Could not safely match DO "%s" to an existing designation.', $name);

        return [
            'id' => null,
            'name' => $name,
            'region' => $region,
            'country' => $country,
            'matched' => false,
        ];
    }

    /**
     * @param array<string,mixed>|null $value
     *
     * @return array{lat: float, lng: float}|null
     */
    private function normalizeMapData(mixed $value): ?array
    {
        if (!is_array($value)) {
            return null;
        }

        $lat = $this->normalizeFloat($value['lat'] ?? null);
        $lng = $this->normalizeFloat($value['lng'] ?? null);

        if (null === $lat || null === $lng) {
            return null;
        }

        return ['lat' => $lat, 'lng' => $lng];
    }

    /**
     * @param class-string<WineType|Country|AgingType|PlaceType> $enumClass
     * @param list<string> $warnings
     */
    private function normalizeEnumString(mixed $value, string $enumClass, string $field, array &$warnings): ?string
    {
        $normalized = $this->normalizeNullableString($value);
        if (null === $normalized) {
            return null;
        }

        $enum = $enumClass::tryFrom($normalized);
        if (null === $enum) {
            $warnings[] = sprintf('AI returned unsupported %s value "%s".', $field, $normalized);
            return null;
        }

        return $enum->value;
    }

    /**
     * @param list<string> $warnings
     */
    private function normalizeAwardName(mixed $value, array &$warnings): ?string
    {
        $normalized = $this->normalizeToken((string) ($value ?? ''));
        if ('' === $normalized) {
            return null;
        }

        $aliases = [
            'guia proensa' => AwardName::GuiaProensa,
            'wine spectator' => AwardName::WineSpectator,
            'james suckling' => AwardName::JamesSuckling,
        ];

        if (isset($aliases[$normalized])) {
            return $aliases[$normalized]->value;
        }

        $candidate = AwardName::tryFrom(str_replace(' ', '_', $normalized));
        if (null === $candidate) {
            $warnings[] = sprintf('AI returned unsupported award value "%s".', (string) $value);
            return null;
        }

        return $candidate->value;
    }

    private function normalizeCountry(mixed $value): ?string
    {
        $normalized = $this->normalizeNullableString($value);
        if (null === $normalized) {
            return null;
        }

        return Country::tryFrom($normalized)?->value;
    }

    private function normalizeConfidence(mixed $value): string
    {
        $allowed = ['low', 'medium', 'high'];
        return is_string($value) && in_array($value, $allowed, true) ? $value : 'medium';
    }

    private function normalizeSource(mixed $value): string
    {
        $allowed = ['image', 'ticket', 'user_text', 'location', 'internet', 'combined'];
        return is_string($value) && in_array($value, $allowed, true) ? $value : 'combined';
    }

    private function normalizeNullableString(mixed $value): ?string
    {
        if (!is_string($value)) {
            return null;
        }

        $normalized = trim($value);

        return '' === $normalized ? null : $normalized;
    }

    private function normalizeInt(mixed $value): ?int
    {
        if (is_int($value)) {
            return $value;
        }

        if (is_string($value) && preg_match('/^\d+$/', $value)) {
            return (int) $value;
        }

        return null;
    }

    private function normalizeFloat(mixed $value): ?float
    {
        if (is_int($value) || is_float($value)) {
            return (float) $value;
        }

        if (is_string($value) && is_numeric($value)) {
            return (float) $value;
        }

        return null;
    }

    private function normalizeToken(string $value): string
    {
        $normalized = trim(mb_strtolower($value));
        $ascii = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $normalized);
        $normalized = false === $ascii ? $normalized : $ascii;
        $normalized = preg_replace('/[_-]+/', ' ', $normalized) ?? '';
        $normalized = preg_replace('/\s+/', ' ', $normalized) ?? '';

        return trim($normalized);
    }

    /**
     * @param array<string,mixed> $wine
     * @param array<string,mixed> $purchase
     *
     * @return list<string>
     */
    private function computeMissingRequiredFields(array $wine, array $purchase): array
    {
        $missing = [];

        if (null === ($wine['name'] ?? null)) {
            $missing[] = 'wine.name';
        }

        if (null === ($purchase['place_name'] ?? null)) {
            $missing[] = 'purchase.place_name';
        }

        if (null === ($purchase['price_paid'] ?? null)) {
            $missing[] = 'purchase.price_paid';
        }

        if (null === ($purchase['purchased_at'] ?? null)) {
            $missing[] = 'purchase.purchased_at';
        }

        return $missing;
    }
}
