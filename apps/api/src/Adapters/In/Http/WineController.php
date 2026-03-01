<?php

declare(strict_types=1);

namespace App\Adapters\In\Http;

use App\Application\UseCases\Wine\CreateWine\CreateWineAwardInput;
use App\Application\UseCases\Wine\CreateWine\CreateWineCommand;
use App\Application\UseCases\Wine\CreateWine\CreateWineGrapeInput;
use App\Application\UseCases\Wine\CreateWine\CreateWineHandler;
use App\Application\UseCases\Wine\CreateWine\CreateWinePlaceInput;
use App\Application\UseCases\Wine\CreateWine\CreateWinePurchaseInput;
use App\Application\UseCases\Wine\CreateWine\CreateWineReferenceNotFound;
use App\Application\UseCases\Wine\CreateWine\CreateWineValidationException;
use App\Application\UseCases\Wine\DeleteWine\DeleteWineHandler;
use App\Application\UseCases\Wine\DeleteWine\WineNotFound;
use App\Application\UseCases\Wine\GetWine\GetWineDetailsHandler;
use App\Application\UseCases\Wine\GetWine\GetWineDetailsNotFound;
use App\Application\UseCases\Wine\ListWines\ListWinesHandler;
use App\Application\UseCases\Wine\ListWines\ListWinesQuery;
use App\Application\UseCases\Wine\ListWines\ListWinesSort;
use App\Application\UseCases\Wine\ListWines\ListWinesValidationException;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineCommand;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineHandler;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineNotFound;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineReferenceNotFound;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineValidationException;
use App\Domain\Enum\AgingType;
use App\Domain\Enum\AwardName;
use App\Domain\Enum\Country;
use App\Domain\Enum\PlaceType;
use App\Domain\Enum\WineType;
use App\Domain\Model\DenominationOfOrigin;
use App\Domain\Model\Wine;
use App\Domain\Repository\WinePhotoRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class WineController
{
    public function __construct(
        private readonly CreateWineHandler $createWineHandler,
        private readonly UpdateWineHandler $updateWineHandler,
        private readonly DeleteWineHandler $deleteWineHandler,
        private readonly GetWineDetailsHandler $getWineDetailsHandler,
        private readonly ListWinesHandler $listWinesHandler,
        private readonly WinePhotoRepository $winePhotos,
    ) {
    }

    #[Route('/api/wines', name: 'api_wines_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        try {
            $page = $this->parsePositiveIntQuery($request->query->get('page'), 'page', 1);
            $limit = $this->parsePositiveIntQuery($request->query->get('limit'), 'limit', 20);

            $search = $request->query->get('search');
            if (null !== $search && !is_string($search)) {
                return new JsonResponse(['error' => 'search must be a string.'], Response::HTTP_BAD_REQUEST);
            }
            $search = null === $search ? null : trim($search);
            if ('' === $search) {
                $search = null;
            }

            $wineTypeRaw = $request->query->get('wine_type');
            if (null !== $wineTypeRaw && !is_string($wineTypeRaw)) {
                return new JsonResponse(['error' => 'wine_type must be a string.'], Response::HTTP_BAD_REQUEST);
            }
            $wineType = null;
            if (null !== $wineTypeRaw && '' !== trim($wineTypeRaw)) {
                try {
                    $wineType = WineType::from(trim($wineTypeRaw));
                } catch (\ValueError) {
                    return new JsonResponse(['error' => 'Invalid wine_type value.'], Response::HTTP_BAD_REQUEST);
                }
            }

            $sortBy = $request->query->get('sort_by');
            if (null !== $sortBy && !is_string($sortBy)) {
                return new JsonResponse(['error' => 'sort_by must be a string.'], Response::HTTP_BAD_REQUEST);
            }
            $sortBy = null === $sortBy ? ListWinesSort::CREATED_AT : trim($sortBy);

            $sortDir = $request->query->get('sort_dir');
            if (null !== $sortDir && !is_string($sortDir)) {
                return new JsonResponse(['error' => 'sort_dir must be a string.'], Response::HTTP_BAD_REQUEST);
            }
            $sortDir = null === $sortDir ? ListWinesSort::DESC : strtolower(trim($sortDir));

            $countryRaw = $request->query->get('country');
            if (null !== $countryRaw && !is_string($countryRaw)) {
                return new JsonResponse(['error' => 'country must be a string.'], Response::HTTP_BAD_REQUEST);
            }

            $country = null;
            if (null !== $countryRaw && '' !== trim($countryRaw)) {
                try {
                    $country = Country::from(trim($countryRaw));
                } catch (\ValueError) {
                    return new JsonResponse(['error' => 'Invalid country value.'], Response::HTTP_BAD_REQUEST);
                }
            }

            $doId = $this->parseNullableIntQuery($request->query->get('do_id'), 'do_id');
            $grapeId = $this->parseNullableIntQuery($request->query->get('grape_id'), 'grape_id');
            $scoreMin = $this->parseNullableIntQuery($request->query->get('score_min'), 'score_min');
            $scoreMax = $this->parseNullableIntQuery($request->query->get('score_max'), 'score_max');

            $scoreBucketRaw = $request->query->get('score_bucket');
            if (null !== $scoreBucketRaw && !is_string($scoreBucketRaw)) {
                return new JsonResponse(['error' => 'score_bucket must be a string.'], Response::HTTP_BAD_REQUEST);
            }
            if (null !== $scoreBucketRaw && '' !== trim($scoreBucketRaw)) {
                [$bucketMin, $bucketMax] = $this->parseScoreBucket(trim($scoreBucketRaw));
                if (null === $scoreMin) {
                    $scoreMin = $bucketMin;
                }
                if (null === $scoreMax) {
                    $scoreMax = $bucketMax;
                }
            }

            $result = $this->listWinesHandler->handle(new ListWinesQuery(
                page: $page,
                limit: $limit,
                search: $search,
                wineType: $wineType,
                country: $country,
                doId: $doId,
                grapeId: $grapeId,
                scoreMin: $scoreMin,
                scoreMax: $scoreMax,
                sortBy: $sortBy,
                sortDir: $sortDir,
            ));
        } catch (ListWinesValidationException $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        }

        return new JsonResponse([
            'items' => array_map(
                function ($item): array {
                    $photos = $this->winePhotos->findByWineId($item->id);

                    return [
                        'id' => $item->id,
                        'name' => $item->name,
                        'winery' => $item->winery,
                        'wine_type' => $item->wineType,
                        'country' => $item->country,
                        'do' => null === $item->doId ? null : [
                            'id' => $item->doId,
                            'name' => $item->doName,
                        ],
                        'vintage_year' => $item->vintageYear,
                        'avg_score' => $item->avgScore,
                        'updated_at' => $item->updatedAt,
                        'photos' => array_map(
                            static fn ($photo): array => [
                                'type' => $photo->type->value,
                                'url' => $photo->url,
                            ],
                            $photos,
                        ),
                    ];
                },
                $result->items,
            ),
            'pagination' => [
                'page' => $result->page,
                'limit' => $result->limit,
                'total_items' => $result->totalItems,
                'total_pages' => $result->totalPages,
                'has_next' => $result->page < $result->totalPages,
                'has_prev' => $result->page > 1,
            ],
        ], Response::HTTP_OK);
    }

    #[Route('/api/wines', name: 'api_wines_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);
        if (!is_array($payload)) {
            return new JsonResponse(['error' => 'Invalid JSON body.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $command = $this->buildCommand($payload);
            $result = $this->createWineHandler->handle($command);
        } catch (CreateWineValidationException $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (CreateWineReferenceNotFound $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse(['wine' => ['id' => $result->id]], Response::HTTP_CREATED);
    }

    #[Route('/api/wines/{id}', name: 'api_wines_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);
        if (!is_array($payload)) {
            return new JsonResponse(['error' => 'Invalid JSON body.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $command = $this->buildUpdateCommand($id, $payload);
            $this->updateWineHandler->handle($command);
        } catch (UpdateWineValidationException|CreateWineValidationException $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (UpdateWineReferenceNotFound|UpdateWineNotFound $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/api/wines/{id}', name: 'api_wines_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        try {
            $this->deleteWineHandler->handle($id);
        } catch (WineNotFound $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/api/wines/{id}', name: 'api_wines_get', methods: ['GET'])]
    public function getById(int $id): JsonResponse
    {
        try {
            $wine = $this->getWineDetailsHandler->handle($id);
        } catch (GetWineDetailsNotFound $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse(['wine' => $this->winePayload($wine)], Response::HTTP_OK);
    }

    /**
     * @param array<string,mixed> $payload
     */
    private function buildCommand(array $payload): CreateWineCommand
    {
        $name = $payload['name'] ?? null;
        if (!is_string($name)) {
            throw new CreateWineValidationException('name is required.');
        }

        $winery = $payload['winery'] ?? null;
        if (null !== $winery && !is_string($winery)) {
            throw new CreateWineValidationException('winery must be a string.');
        }

        $wineType = $this->parseEnum($payload['wine_type'] ?? null, WineType::class, 'wine_type');
        $country = $this->parseEnum($payload['country'] ?? null, Country::class, 'country');
        $agingType = $this->parseEnum($payload['aging_type'] ?? null, AgingType::class, 'aging_type');

        $doId = $this->parseNullableInt($payload['do_id'] ?? null, 'do_id');
        $vintageYear = $this->parseNullableInt($payload['vintage_year'] ?? null, 'vintage_year');
        $alcoholPercentage = $this->parseNullableNumber($payload['alcohol_percentage'] ?? null, 'alcohol_percentage');

        $grapesPayload = $payload['grapes'] ?? $payload['wine_grapes'] ?? [];
        $purchasesPayload = $payload['purchases'] ?? $payload['wine_purchase'] ?? [];

        $grapes = $this->parseGrapes($grapesPayload);
        $purchases = $this->parsePurchases($purchasesPayload);
        $awards = $this->parseAwards($payload['awards'] ?? []);

        return new CreateWineCommand(
            name: $name,
            winery: $winery,
            wineType: $wineType,
            doId: $doId,
            country: $country,
            agingType: $agingType,
            vintageYear: $vintageYear,
            alcoholPercentage: $alcoholPercentage,
            grapes: $grapes,
            purchases: $purchases,
            awards: $awards,
        );
    }

    /**
     * @param array<string,mixed> $payload
     */
    private function buildUpdateCommand(int $id, array $payload): UpdateWineCommand
    {
        $provided = [
            'name' => array_key_exists('name', $payload),
            'winery' => array_key_exists('winery', $payload),
            'wine_type' => array_key_exists('wine_type', $payload),
            'do_id' => array_key_exists('do_id', $payload),
            'country' => array_key_exists('country', $payload),
            'aging_type' => array_key_exists('aging_type', $payload),
            'vintage_year' => array_key_exists('vintage_year', $payload),
            'alcohol_percentage' => array_key_exists('alcohol_percentage', $payload),
        ];

        $name = $this->parseNullableString($payload['name'] ?? null, 'name', $provided['name']);
        $winery = $this->parseNullableString($payload['winery'] ?? null, 'winery', $provided['winery']);
        $wineType = $this->parseEnum($payload['wine_type'] ?? null, WineType::class, 'wine_type');
        $doId = $this->parseNullableInt($payload['do_id'] ?? null, 'do_id');
        $country = $this->parseEnum($payload['country'] ?? null, Country::class, 'country');
        $agingType = $this->parseEnum($payload['aging_type'] ?? null, AgingType::class, 'aging_type');
        $vintageYear = $this->parseNullableInt($payload['vintage_year'] ?? null, 'vintage_year');
        $alcoholPercentage = $this->parseNullableNumber($payload['alcohol_percentage'] ?? null, 'alcohol_percentage');

        return new UpdateWineCommand(
            wineId: $id,
            name: $name,
            winery: $winery,
            wineType: $wineType,
            doId: $doId,
            country: $country,
            agingType: $agingType,
            vintageYear: $vintageYear,
            alcoholPercentage: $alcoholPercentage,
            provided: $provided,
        );
    }

    /**
     * @param mixed $value
     * @param class-string<WineType|Country|AgingType|AwardName> $enumClass
     */
    private function parseEnum(mixed $value, string $enumClass, string $field): WineType|Country|AgingType|AwardName|null
    {
        if (null === $value) {
            return null;
        }

        if (!is_string($value)) {
            throw new CreateWineValidationException(sprintf('%s must be a string.', $field));
        }

        try {
            return $enumClass::from($value);
        } catch (\ValueError) {
            throw new CreateWineValidationException(sprintf('Invalid %s value.', $field));
        }
    }

    private function parseNullableInt(mixed $value, string $field): ?int
    {
        if (null === $value) {
            return null;
        }

        if (!is_int($value)) {
            throw new CreateWineValidationException(sprintf('%s must be an integer.', $field));
        }

        return $value;
    }

    private function parseNullableNumber(mixed $value, string $field): ?float
    {
        if (null === $value) {
            return null;
        }

        if (!is_int($value) && !is_float($value)) {
            throw new CreateWineValidationException(sprintf('%s must be numeric.', $field));
        }

        return (float) $value;
    }

    private function parseNullableString(mixed $value, string $field, bool $isProvided): ?string
    {
        if (!$isProvided) {
            return null;
        }

        if (null === $value) {
            return null;
        }

        if (!is_string($value)) {
            throw new CreateWineValidationException(sprintf('%s must be a string or null.', $field));
        }

        return $value;
    }

    private function parsePositiveIntQuery(mixed $value, string $field, int $default): int
    {
        if (null === $value || '' === $value) {
            return $default;
        }

        if (is_int($value)) {
            return $value;
        }

        if (!is_string($value) || !preg_match('/^\d+$/', $value)) {
            throw new ListWinesValidationException(sprintf('%s must be a positive integer.', $field));
        }

        return (int) $value;
    }

    private function parseNullableIntQuery(mixed $value, string $field): ?int
    {
        if (null === $value || '' === $value) {
            return null;
        }

        if (is_int($value)) {
            return $value;
        }

        if (!is_string($value) || !preg_match('/^\d+$/', $value)) {
            throw new ListWinesValidationException(sprintf('%s must be an integer.', $field));
        }

        return (int) $value;
    }

    /**
     * @return array{0:?int,1:?int}
     */
    private function parseScoreBucket(string $value): array
    {
        return match (strtolower($value)) {
            'any' => [null, null],
            'lt70', '<70' => [null, 69],
            '70_80', '70-80' => [70, 80],
            '80_90', '80-90' => [80, 90],
            '90_plus', '90+' => [90, null],
            default => throw new ListWinesValidationException('Invalid score_bucket value.'),
        };
    }

    /**
     * @param mixed $value
     *
     * @return list<CreateWineGrapeInput>
     */
    private function parseGrapes(mixed $value): array
    {
        if (!is_array($value)) {
            throw new CreateWineValidationException('grapes must be an array.');
        }

        $result = [];
        foreach ($value as $index => $item) {
            if (!is_array($item)) {
                throw new CreateWineValidationException(sprintf('grapes[%d] must be an object.', $index));
            }

            $grapeId = $this->parseNullableInt($item['grape_id'] ?? null, sprintf('grapes[%d].grape_id', $index));
            if (null === $grapeId) {
                throw new CreateWineValidationException(sprintf('grapes[%d].grape_id is required.', $index));
            }

            $percentage = $item['percentage'] ?? null;
            if (null !== $percentage && !is_int($percentage) && !is_float($percentage) && !is_string($percentage)) {
                throw new CreateWineValidationException(sprintf('grapes[%d].percentage must be numeric.', $index));
            }

            $result[] = new CreateWineGrapeInput($grapeId, null === $percentage ? null : (string) $percentage);
        }

        return $result;
    }

    /**
     * @param mixed $value
     *
     * @return list<CreateWinePurchaseInput>
     */
    private function parsePurchases(mixed $value): array
    {
        if (!is_array($value)) {
            throw new CreateWineValidationException('purchases must be an array.');
        }

        $result = [];
        foreach ($value as $index => $item) {
            if (!is_array($item)) {
                throw new CreateWineValidationException(sprintf('purchases[%d] must be an object.', $index));
            }

            $place = $item['place'] ?? null;
            if (!is_array($place)) {
                throw new CreateWineValidationException(sprintf('purchases[%d].place is required.', $index));
            }

            $placeTypeRaw = $place['place_type'] ?? null;
            if (!is_string($placeTypeRaw)) {
                throw new CreateWineValidationException(sprintf('purchases[%d].place.place_type is required.', $index));
            }

            try {
                $placeType = PlaceType::from($placeTypeRaw);
            } catch (\ValueError) {
                throw new CreateWineValidationException(sprintf('Invalid purchases[%d].place.place_type value.', $index));
            }

            $placeName = $place['name'] ?? null;
            if (!is_string($placeName)) {
                throw new CreateWineValidationException(sprintf('purchases[%d].place.name is required.', $index));
            }

            $placeCountryRaw = $place['country'] ?? null;
            if (!is_string($placeCountryRaw)) {
                throw new CreateWineValidationException(sprintf('purchases[%d].place.country is required.', $index));
            }

            try {
                $placeCountry = Country::from($placeCountryRaw);
            } catch (\ValueError) {
                throw new CreateWineValidationException(sprintf('Invalid purchases[%d].place.country value.', $index));
            }

            $address = $place['address'] ?? null;
            if (null !== $address && !is_string($address)) {
                throw new CreateWineValidationException(sprintf('purchases[%d].place.address must be a string or null.', $index));
            }

            $city = $place['city'] ?? null;
            if (null !== $city && !is_string($city)) {
                throw new CreateWineValidationException(sprintf('purchases[%d].place.city must be a string or null.', $index));
            }

            $pricePaid = $item['price_paid'] ?? null;
            if (!is_int($pricePaid) && !is_float($pricePaid) && !is_string($pricePaid)) {
                throw new CreateWineValidationException(sprintf('purchases[%d].price_paid is required and must be numeric.', $index));
            }

            $purchasedAt = $item['purchased_at'] ?? null;
            if (!is_string($purchasedAt)) {
                throw new CreateWineValidationException(sprintf('purchases[%d].purchased_at is required.', $index));
            }

            try {
                $parsedPurchasedAt = new \DateTimeImmutable($purchasedAt);
            } catch (\Exception) {
                throw new CreateWineValidationException(sprintf('purchases[%d].purchased_at must be a valid datetime.', $index));
            }

            $result[] = new CreateWinePurchaseInput(
                new CreateWinePlaceInput($placeType, $placeName, $address, $city, $placeCountry),
                (string) $pricePaid,
                $parsedPurchasedAt,
            );
        }

        return $result;
    }

    /**
     * @param mixed $value
     *
     * @return list<CreateWineAwardInput>
     */
    private function parseAwards(mixed $value): array
    {
        if (!is_array($value)) {
            throw new CreateWineValidationException('awards must be an array.');
        }

        $result = [];
        foreach ($value as $index => $item) {
            if (!is_array($item)) {
                throw new CreateWineValidationException(sprintf('awards[%d] must be an object.', $index));
            }

            $nameRaw = $item['name'] ?? null;
            if (!is_string($nameRaw)) {
                throw new CreateWineValidationException(sprintf('awards[%d].name is required.', $index));
            }

            try {
                $name = AwardName::from($nameRaw);
            } catch (\ValueError) {
                throw new CreateWineValidationException(sprintf('Invalid awards[%d].name value.', $index));
            }

            $score = $item['score'] ?? null;
            if (null !== $score && !is_int($score) && !is_float($score) && !is_string($score)) {
                throw new CreateWineValidationException(sprintf('awards[%d].score must be numeric.', $index));
            }

            $year = $item['year'] ?? null;
            if (null !== $year && !is_int($year)) {
                throw new CreateWineValidationException(sprintf('awards[%d].year must be an integer.', $index));
            }

            $result[] = new CreateWineAwardInput($name, null === $score ? null : (string) $score, $year);
        }

        return $result;
    }

    /**
     * @return array{
     *     id:int,
     *     name:string,
     *     winery:?string,
     *     wine_type:?string,
     *     do:?array{id:int,name:string,region:string,country:string,country_code:string},
     *     country:?string,
     *     aging_type:?string,
     *     vintage_year:?int,
     *     alcohol_percentage:?float,
     *     created_at:string,
     *     updated_at:string,
     *     grapes:list<array{id:int,name:string,color:string,percentage:?float}>,
     *     purchases:list<array{id:int,place:array{id:int,place_type:string,name:string,address:?string,city:?string,country:string},price_paid:float,purchased_at:string}>,
     *     awards:list<array{id:int,name:string,score:?float,year:?int}>,
     *     photos:list<array{id:int,type:?string,url:string,hash:string,size:int,extension:string}>,
     *     reviews:list<array{id:int,user:array{id:int,name:string,lastname:string},score:?int,intensity_aroma:int,sweetness:int,acidity:int,tannin:?int,body:int,persistence:int,bullets:list<string>,created_at:string}>
     * }
     */
    private function winePayload(Wine $wine): array
    {
        return [
            'id' => $wine->id,
            'name' => $wine->name,
            'winery' => $wine->winery,
            'wine_type' => $wine->wineType?->value,
            'do' => $this->doPayload($wine->do),
            'country' => $wine->country?->value,
            'aging_type' => $wine->agingType?->value,
            'vintage_year' => $wine->vintageYear,
            'alcohol_percentage' => $wine->alcoholPercentage,
            'created_at' => $wine->createdAt,
            'updated_at' => $wine->updatedAt,
            'grapes' => array_map(
                static fn ($grape): array => [
                    'id' => $grape->grapeId,
                    'name' => $grape->name,
                    'color' => $grape->color?->value,
                    'percentage' => $grape->percentageAsFloat(),
                ],
                $wine->grapes,
            ),
            'purchases' => array_map(
                static fn ($purchase): array => [
                    'id' => $purchase->id,
                    'place' => [
                        'id' => $purchase->place->id,
                        'place_type' => $purchase->place->placeType->value,
                        'name' => $purchase->place->name,
                        'address' => $purchase->place->address,
                        'city' => $purchase->place->city,
                        'country' => $purchase->place->country->value,
                    ],
                    'price_paid' => $purchase->pricePaidAsFloat(),
                    'purchased_at' => $purchase->purchasedAt->format(\DateTimeInterface::ATOM),
                ],
                $wine->purchases,
            ),
            'awards' => array_map(
                static fn ($award): array => [
                    'id' => $award->id,
                    'name' => $award->name->value,
                    'score' => $award->scoreAsFloat(),
                    'year' => $award->year,
                ],
                $wine->awards,
            ),
            'photos' => array_map(
                static fn ($photo): array => [
                    'id' => $photo->id,
                    'type' => $photo->type->value,
                    'url' => $photo->url,
                    'hash' => $photo->hash,
                    'size' => $photo->size,
                    'extension' => $photo->extension,
                ],
                $wine->photos,
            ),
            'reviews' => array_map(
                static fn ($review): array => [
                    'id' => $review->id,
                    'user' => [
                        'id' => $review->userId,
                        'name' => $review->userName,
                        'lastname' => $review->userLastname,
                    ],
                    'score' => $review->score,
                    'intensity_aroma' => $review->intensityAroma,
                    'sweetness' => $review->sweetness,
                    'acidity' => $review->acidity,
                    'tannin' => $review->tannin,
                    'body' => $review->body,
                    'persistence' => $review->persistence,
                    'bullets' => $review->bulletsAsValues(),
                    'created_at' => $review->createdAt?->format(\DateTimeInterface::ATOM),
                ],
                $wine->reviews,
            ),
        ];
    }

    /**
     * @return array{id:int,name:string,region:string,country:string,country_code:string}|null
     */
    private function doPayload(?DenominationOfOrigin $wineDo): ?array
    {
        if (null === $wineDo) {
            return null;
        }

        return [
            'id' => $wineDo->id,
            'name' => $wineDo->name,
            'region' => $wineDo->region,
            'country' => $wineDo->country->value,
            'country_code' => $wineDo->countryCode,
        ];
    }
}
