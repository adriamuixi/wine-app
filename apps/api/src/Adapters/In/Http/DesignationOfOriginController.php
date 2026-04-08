<?php

declare(strict_types=1);

namespace App\Adapters\In\Http;

use App\Application\Ports\AuthSessionManager;
use App\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOrigin\CreateDesignationOfOriginCommand;
use App\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOrigin\CreateDesignationOfOriginHandler;
use App\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOrigin\CreateDesignationOfOriginValidationException;
use App\Application\UseCases\DesignationOfOrigin\DeleteDesignationOfOrigin\DeleteDesignationOfOriginHandler;
use App\Application\UseCases\DesignationOfOrigin\DeleteDesignationOfOrigin\DeleteDesignationOfOriginHasAssociatedWines;
use App\Application\UseCases\DesignationOfOrigin\DeleteDesignationOfOrigin\DeleteDesignationOfOriginNotFound;
use App\Application\UseCases\DesignationOfOrigin\ListDesignationsOfOrigin\ListDesignationsOfOriginHandler;
use App\Application\UseCases\DesignationOfOrigin\ListDesignationsOfOrigin\ListDesignationsOfOriginQuery;
use App\Application\UseCases\DesignationOfOrigin\ListDesignationsOfOrigin\ListDesignationsOfOriginSort;
use App\Application\UseCases\DesignationOfOrigin\UpdateDesignationOfOrigin\UpdateDesignationOfOriginCommand;
use App\Application\UseCases\DesignationOfOrigin\UpdateDesignationOfOrigin\UpdateDesignationOfOriginHandler;
use App\Application\UseCases\DesignationOfOrigin\UpdateDesignationOfOrigin\UpdateDesignationOfOriginNotFound;
use App\Application\UseCases\DesignationOfOrigin\UpdateDesignationOfOrigin\UpdateDesignationOfOriginValidationException;
use App\Domain\Enum\Country;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class DesignationOfOriginController
{
    public function __construct(
        private readonly AuthSessionManager $authSession,
        private readonly CreateDesignationOfOriginHandler $createDoHandler,
        private readonly ListDesignationsOfOriginHandler $listDosHandler,
        private readonly UpdateDesignationOfOriginHandler $updateDoHandler,
        private readonly DeleteDesignationOfOriginHandler $deleteDoHandler,
    ) {
    }

    #[Route('/api/dos', name: 'api_dos_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        if (null === $this->authSession->getAuthenticatedUserId()) {
            return new JsonResponse(['error' => 'Unauthenticated.'], Response::HTTP_UNAUTHORIZED);
        }

        $payload = json_decode($request->getContent(), true);
        if (!is_array($payload)) {
            return new JsonResponse(['error' => 'Invalid JSON body.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $command = $this->buildCreateCommand($payload);
            $result = $this->createDoHandler->handle($command);
        } catch (CreateDesignationOfOriginValidationException $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (UniqueConstraintViolationException) {
            return new JsonResponse(['error' => 'A denomination of origin with the same country and name already exists.'], Response::HTTP_CONFLICT);
        }

        return new JsonResponse(['do' => ['id' => $result->id]], Response::HTTP_CREATED);
    }

    #[Route('/api/dos', name: 'api_dos_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        try {
            $sortFields = $this->parseSortFields($request);
            $nameFilter = $this->parseOptionalStringFilter($request, 'name');
            $countryFilter = $this->parseCountryFilter($request, 'country');
            $regionFilter = $this->parseOptionalStringFilter($request, 'region');
            $userIdsFilter = $this->parseUserIdsFilter($request, 'user_ids');
            $hasWinesFilter = $this->parseOptionalBooleanFilter($request, 'has_wines');
        } catch (\InvalidArgumentException $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        }

        $items = $this->listDosHandler->handle(new ListDesignationsOfOriginQuery(
            sortFields: $sortFields,
            name: $nameFilter,
            country: $countryFilter,
            region: $regionFilter,
            userIds: $userIdsFilter,
            hasWines: $hasWinesFilter,
        ));

        return new JsonResponse([
            'items' => array_map(
                static fn ($do): array => [
                    'id' => $do->id,
                    'name' => $do->name,
                    'region' => $do->region,
                    'country' => $do->country->value,
                    'country_code' => $do->countryCode,
                    'do_logo' => $do->doLogo,
                    'region_logo' => $do->regionLogo,
                    'map_data' => $do->mapData,
                ],
                $items,
            ),
        ], Response::HTTP_OK);
    }

    #[Route('/api/dos/{id}', name: 'api_dos_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        if (null === $this->authSession->getAuthenticatedUserId()) {
            return new JsonResponse(['error' => 'Unauthenticated.'], Response::HTTP_UNAUTHORIZED);
        }

        $payload = json_decode($request->getContent(), true);
        if (!is_array($payload)) {
            return new JsonResponse(['error' => 'Invalid JSON body.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $command = $this->buildUpdateCommand($id, $payload);
            $this->updateDoHandler->handle($command);
        } catch (UpdateDesignationOfOriginValidationException $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (UpdateDesignationOfOriginNotFound $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/api/dos/{id}', name: 'api_dos_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        if (null === $this->authSession->getAuthenticatedUserId()) {
            return new JsonResponse(['error' => 'Unauthenticated.'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            $this->deleteDoHandler->handle($id);
        } catch (DeleteDesignationOfOriginNotFound $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        } catch (DeleteDesignationOfOriginHasAssociatedWines $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_CONFLICT);
        }

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    /** @return list<string> */
    private function parseSortFields(Request $request): array
    {
        $sortFields = [];

        foreach ([1, 2, 3] as $position) {
            $fieldName = sprintf('sort_by_%d', $position);
            $value = $request->query->get($fieldName);

            if (null === $value || '' === trim((string) $value)) {
                continue;
            }

            if (!is_string($value)) {
                throw new \InvalidArgumentException(sprintf('%s must be a string.', $fieldName));
            }

            $normalized = trim(strtolower($value));
            if (!in_array($normalized, ListDesignationsOfOriginSort::ALLOWED, true)) {
                throw new \InvalidArgumentException(sprintf('Invalid %s value.', $fieldName));
            }

            if (in_array($normalized, $sortFields, true)) {
                throw new \InvalidArgumentException(sprintf('%s contains duplicate sort field "%s".', $fieldName, $normalized));
            }

            $sortFields[] = $normalized;
        }

        if ([] === $sortFields) {
            return ListDesignationsOfOriginSort::DEFAULT_ORDER;
        }

        foreach (ListDesignationsOfOriginSort::DEFAULT_ORDER as $defaultField) {
            if (!in_array($defaultField, $sortFields, true)) {
                $sortFields[] = $defaultField;
            }
        }

        return array_slice($sortFields, 0, 3);
    }

    /**
     * @param array<string,mixed> $payload
     */
    private function buildCreateCommand(array $payload): CreateDesignationOfOriginCommand
    {
        $name = $payload['name'] ?? null;
        if (!is_string($name)) {
            throw new CreateDesignationOfOriginValidationException('name is required.');
        }

        $region = $payload['region'] ?? null;
        if (!is_string($region)) {
            throw new CreateDesignationOfOriginValidationException('region is required.');
        }

        $countryRaw = $payload['country'] ?? null;
        if (!is_string($countryRaw)) {
            throw new CreateDesignationOfOriginValidationException('country is required.');
        }

        try {
            $country = Country::from($countryRaw);
        } catch (\ValueError) {
            throw new CreateDesignationOfOriginValidationException('Invalid country value.');
        }

        $countryCode = $payload['country_code'] ?? null;
        if (!is_string($countryCode)) {
            throw new CreateDesignationOfOriginValidationException('country_code is required.');
        }

        $doLogo = $payload['do_logo'] ?? null;
        if (null !== $doLogo && !is_string($doLogo)) {
            throw new CreateDesignationOfOriginValidationException('do_logo must be a string or null.');
        }

        if (array_key_exists('region_logo', $payload)) {
            throw new CreateDesignationOfOriginValidationException('region_logo cannot be created via this endpoint.');
        }

        $mapData = $this->parseDoMapData($payload['map_data'] ?? null, 'map_data', array_key_exists('map_data', $payload), true);

        return new CreateDesignationOfOriginCommand(
            name: $name,
            region: $region,
            country: $country,
            countryCode: strtoupper($countryCode),
            doLogo: $doLogo,
            mapData: $mapData,
        );
    }

    /**
     * @param array<string,mixed> $payload
     */
    private function buildUpdateCommand(int $id, array $payload): UpdateDesignationOfOriginCommand
    {
        $provided = [
            'name' => array_key_exists('name', $payload),
            'region' => array_key_exists('region', $payload),
            'country' => array_key_exists('country', $payload),
            'country_code' => array_key_exists('country_code', $payload),
            'do_logo' => array_key_exists('do_logo', $payload),
            'region_logo' => array_key_exists('region_logo', $payload),
            'map_data' => array_key_exists('map_data', $payload),
        ];

        return new UpdateDesignationOfOriginCommand(
            doId: $id,
            name: $this->parseNullableString($payload['name'] ?? null, 'name', $provided['name']),
            region: $this->parseNullableString($payload['region'] ?? null, 'region', $provided['region']),
            country: $this->parseCountry($payload['country'] ?? null, $provided['country']),
            countryCode: $this->parseCountryCode($payload['country_code'] ?? null, $provided['country_code']),
            doLogo: $this->parseNullableString($payload['do_logo'] ?? null, 'do_logo', $provided['do_logo']),
            regionLogo: $this->parseNullableString($payload['region_logo'] ?? null, 'region_logo', $provided['region_logo']),
            mapData: $this->parseDoMapData($payload['map_data'] ?? null, 'map_data', $provided['map_data'], false),
            provided: $provided,
        );
    }

    private function parseDoMapData(
        mixed $value,
        string $field,
        bool $isProvided,
        bool $isCreate,
    ): ?array {
        if (!$isProvided) {
            return null;
        }

        if (null === $value) {
            return null;
        }

        if (!is_array($value)) {
            $exceptionClass = $isCreate ? CreateDesignationOfOriginValidationException::class : UpdateDesignationOfOriginValidationException::class;
            throw new $exceptionClass(sprintf('%s must be an object or null.', $field));
        }

        $lat = $value['lat'] ?? null;
        $lng = $value['lng'] ?? null;
        $zoom = $value['zoom'] ?? null;

        if (!is_numeric($lat)) {
            $exceptionClass = $isCreate ? CreateDesignationOfOriginValidationException::class : UpdateDesignationOfOriginValidationException::class;
            throw new $exceptionClass(sprintf('%s.lat must be numeric.', $field));
        }
        if (!is_numeric($lng)) {
            $exceptionClass = $isCreate ? CreateDesignationOfOriginValidationException::class : UpdateDesignationOfOriginValidationException::class;
            throw new $exceptionClass(sprintf('%s.lng must be numeric.', $field));
        }
        if (null !== $zoom && !is_int($zoom)) {
            $exceptionClass = $isCreate ? CreateDesignationOfOriginValidationException::class : UpdateDesignationOfOriginValidationException::class;
            throw new $exceptionClass(sprintf('%s.zoom must be an integer when provided.', $field));
        }

        $latFloat = (float) $lat;
        $lngFloat = (float) $lng;

        if ($latFloat < -90 || $latFloat > 90) {
            $exceptionClass = $isCreate ? CreateDesignationOfOriginValidationException::class : UpdateDesignationOfOriginValidationException::class;
            throw new $exceptionClass('map_data.lat must be between -90 and 90.');
        }
        if ($lngFloat < -180 || $lngFloat > 180) {
            $exceptionClass = $isCreate ? CreateDesignationOfOriginValidationException::class : UpdateDesignationOfOriginValidationException::class;
            throw new $exceptionClass('map_data.lng must be between -180 and 180.');
        }
        if (null !== $zoom && ($zoom < 1 || $zoom > 18)) {
            $exceptionClass = $isCreate ? CreateDesignationOfOriginValidationException::class : UpdateDesignationOfOriginValidationException::class;
            throw new $exceptionClass('map_data.zoom must be between 1 and 18 when provided.');
        }

        $parsed = [
            'lat' => $latFloat,
            'lng' => $lngFloat,
        ];
        if (null !== $zoom) {
            $parsed['zoom'] = $zoom;
        }

        return $parsed;
    }

    private function parseCountry(mixed $value, bool $isProvided): ?Country
    {
        if (!$isProvided) {
            return null;
        }

        if (null === $value) {
            return null;
        }

        if (!is_string($value)) {
            throw new UpdateDesignationOfOriginValidationException('country must be a string.');
        }

        try {
            return Country::from($value);
        } catch (\ValueError) {
            throw new UpdateDesignationOfOriginValidationException('Invalid country value.');
        }
    }

    private function parseCountryCode(mixed $value, bool $isProvided): ?string
    {
        if (!$isProvided) {
            return null;
        }

        if (null === $value) {
            return null;
        }

        if (!is_string($value)) {
            throw new UpdateDesignationOfOriginValidationException('country_code must be a string or null.');
        }

        return strtoupper($value);
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
            throw new UpdateDesignationOfOriginValidationException(sprintf('%s must be a string or null.', $field));
        }

        return $value;
    }

    private function parseOptionalStringFilter(Request $request, string $field): ?string
    {
        $value = $request->query->get($field);
        if (null === $value) {
            return null;
        }
        if (!is_string($value)) {
            throw new \InvalidArgumentException(sprintf('%s must be a string.', $field));
        }
        $trimmed = trim($value);

        return '' === $trimmed ? null : $trimmed;
    }

    private function parseOptionalBooleanFilter(Request $request, string $field): ?bool
    {
        $value = $request->query->get($field);
        if (null === $value) {
            return null;
        }

        if (!is_string($value)) {
            throw new \InvalidArgumentException(sprintf('%s must be a boolean string.', $field));
        }

        $normalized = trim(strtolower($value));
        if ('' === $normalized) {
            return null;
        }

        return match ($normalized) {
            '1', 'true', 'yes' => true,
            '0', 'false', 'no' => false,
            default => throw new \InvalidArgumentException(sprintf('Invalid %s value.', $field)),
        };
    }

    private function parseCountryFilter(Request $request, string $field): ?Country
    {
        $value = $this->parseOptionalStringFilter($request, $field);
        if (null === $value) {
            return null;
        }

        try {
            return Country::from($value);
        } catch (\ValueError) {
            throw new \InvalidArgumentException(sprintf('Invalid %s value.', $field));
        }
    }

    /**
     * @return list<int>
     */
    private function parseUserIdsFilter(Request $request, string $field): array
    {
        $raw = $request->query->get($field);
        if (null === $raw) {
            return [];
        }

        if (!is_string($raw)) {
            throw new \InvalidArgumentException(sprintf('%s must be a comma-separated string of integers.', $field));
        }

        $trimmed = trim($raw);
        if ('' === $trimmed) {
            throw new \InvalidArgumentException(sprintf('%s must include at least one user id.', $field));
        }

        $resolved = [];
        foreach (explode(',', $trimmed) as $token) {
            $candidate = trim($token);
            if ('' === $candidate || !ctype_digit($candidate) || (int) $candidate < 1) {
                throw new \InvalidArgumentException(sprintf('%s must be a comma-separated string of integers >= 1.', $field));
            }

            $resolved[(int) $candidate] = true;
        }

        return array_keys($resolved);
    }
}
