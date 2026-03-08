<?php

declare(strict_types=1);

namespace App\Adapters\In\Http;

use App\Application\UseCases\Do\DeleteDo\DeleteDoHandler;
use App\Application\UseCases\Do\DeleteDo\DeleteDoHasAssociatedWines;
use App\Application\UseCases\Do\DeleteDo\DeleteDoNotFound;
use App\Application\UseCases\Do\ListDos\ListDosHandler;
use App\Application\UseCases\Do\ListDos\ListDosQuery;
use App\Application\UseCases\Do\ListDos\ListDosSort;
use App\Application\UseCases\Do\UpdateDo\UpdateDoCommand;
use App\Application\UseCases\Do\UpdateDo\UpdateDoHandler;
use App\Application\UseCases\Do\UpdateDo\UpdateDoNotFound;
use App\Application\UseCases\Do\UpdateDo\UpdateDoValidationException;
use App\Domain\Enum\Country;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class DoController
{
    public function __construct(
        private readonly ListDosHandler $listDosHandler,
        private readonly UpdateDoHandler $updateDoHandler,
        private readonly DeleteDoHandler $deleteDoHandler,
    ) {
    }

    #[Route('/api/dos', name: 'api_dos_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        try {
            $sortFields = $this->parseSortFields($request);
        } catch (\InvalidArgumentException $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        }

        $items = $this->listDosHandler->handle(new ListDosQuery($sortFields));

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
                ],
                $items,
            ),
        ], Response::HTTP_OK);
    }

    #[Route('/api/dos/{id}', name: 'api_dos_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);
        if (!is_array($payload)) {
            return new JsonResponse(['error' => 'Invalid JSON body.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $command = $this->buildUpdateCommand($id, $payload);
            $this->updateDoHandler->handle($command);
        } catch (UpdateDoValidationException $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (UpdateDoNotFound $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/api/dos/{id}', name: 'api_dos_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        try {
            $this->deleteDoHandler->handle($id);
        } catch (DeleteDoNotFound $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        } catch (DeleteDoHasAssociatedWines $exception) {
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
            if (!in_array($normalized, ListDosSort::ALLOWED, true)) {
                throw new \InvalidArgumentException(sprintf('Invalid %s value.', $fieldName));
            }

            if (in_array($normalized, $sortFields, true)) {
                throw new \InvalidArgumentException(sprintf('%s contains duplicate sort field "%s".', $fieldName, $normalized));
            }

            $sortFields[] = $normalized;
        }

        if ([] === $sortFields) {
            return ListDosSort::DEFAULT_ORDER;
        }

        foreach (ListDosSort::DEFAULT_ORDER as $defaultField) {
            if (!in_array($defaultField, $sortFields, true)) {
                $sortFields[] = $defaultField;
            }
        }

        return array_slice($sortFields, 0, 3);
    }

    /**
     * @param array<string,mixed> $payload
     */
    private function buildUpdateCommand(int $id, array $payload): UpdateDoCommand
    {
        $provided = [
            'name' => array_key_exists('name', $payload),
            'region' => array_key_exists('region', $payload),
            'country' => array_key_exists('country', $payload),
            'country_code' => array_key_exists('country_code', $payload),
            'do_logo' => array_key_exists('do_logo', $payload),
            'region_logo' => array_key_exists('region_logo', $payload),
        ];

        return new UpdateDoCommand(
            doId: $id,
            name: $this->parseNullableString($payload['name'] ?? null, 'name', $provided['name']),
            region: $this->parseNullableString($payload['region'] ?? null, 'region', $provided['region']),
            country: $this->parseCountry($payload['country'] ?? null, $provided['country']),
            countryCode: $this->parseCountryCode($payload['country_code'] ?? null, $provided['country_code']),
            doLogo: $this->parseNullableString($payload['do_logo'] ?? null, 'do_logo', $provided['do_logo']),
            regionLogo: $this->parseNullableString($payload['region_logo'] ?? null, 'region_logo', $provided['region_logo']),
            provided: $provided,
        );
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
            throw new UpdateDoValidationException('country must be a string.');
        }

        try {
            return Country::from($value);
        } catch (\ValueError) {
            throw new UpdateDoValidationException('Invalid country value.');
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
            throw new UpdateDoValidationException('country_code must be a string or null.');
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
            throw new UpdateDoValidationException(sprintf('%s must be a string or null.', $field));
        }

        return $value;
    }
}
