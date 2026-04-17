<?php

declare(strict_types=1);

namespace App\Adapters\In\Http;

use App\Application\Ports\AuthSessionManager;
use App\Application\UseCases\Grape\CreateGrape\CreateGrapeCommand;
use App\Application\UseCases\Grape\CreateGrape\CreateGrapeHandler;
use App\Application\UseCases\Grape\CreateGrape\CreateGrapeValidationException;
use App\Application\UseCases\Grape\DeleteGrape\DeleteGrapeHandler;
use App\Application\UseCases\Grape\DeleteGrape\DeleteGrapeHasAssociatedWines;
use App\Application\UseCases\Grape\DeleteGrape\DeleteGrapeNotFound;
use App\Application\UseCases\Grape\ListGrapes\ListGrapesHandler;
use App\Application\UseCases\Grape\ListGrapes\ListGrapesQuery;
use App\Application\UseCases\Grape\ListGrapes\ListGrapesSort;
use App\Application\UseCases\Grape\UpdateGrape\UpdateGrapeCommand;
use App\Application\UseCases\Grape\UpdateGrape\UpdateGrapeHandler;
use App\Application\UseCases\Grape\UpdateGrape\UpdateGrapeNotFound;
use App\Application\UseCases\Grape\UpdateGrape\UpdateGrapeValidationException;
use App\Domain\Enum\GrapeColor;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class GrapeController
{
    public function __construct(
        private readonly AuthSessionManager $authSession,
        private readonly ListGrapesHandler $listGrapesHandler,
        private readonly CreateGrapeHandler $createGrapeHandler,
        private readonly UpdateGrapeHandler $updateGrapeHandler,
        private readonly DeleteGrapeHandler $deleteGrapeHandler,
    )
    {
    }

    #[Route('/api/grapes', name: 'api_grapes_create', methods: ['POST'])]
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
            $result = $this->createGrapeHandler->handle($command);
        } catch (CreateGrapeValidationException $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (UniqueConstraintViolationException) {
            return new JsonResponse(['error' => 'A grape with the same name already exists.'], Response::HTTP_CONFLICT);
        }

        return new JsonResponse(['grape' => ['id' => $result->id]], Response::HTTP_CREATED);
    }

    #[Route('/api/grapes', name: 'api_grapes_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        try {
            $sortFields = $this->parseSortFields($request);
            $nameFilter = $this->parseOptionalStringFilter($request, 'name');
            $colorFilter = $this->parseColorFilter($request, 'color');
        } catch (\InvalidArgumentException $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        }

        $items = $this->listGrapesHandler->handle(new ListGrapesQuery(
            sortFields: $sortFields,
            name: $nameFilter,
            color: $colorFilter,
        ));

        return new JsonResponse([
            'items' => array_map(
                static fn ($item): array => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'color' => $item->color->value,
                ],
                $items,
            ),
        ], Response::HTTP_OK);
    }

    #[Route('/api/grapes/{id}', name: 'api_grapes_update', methods: ['PUT'])]
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
            $this->updateGrapeHandler->handle($command);
        } catch (UpdateGrapeValidationException $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (UpdateGrapeNotFound $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        } catch (UniqueConstraintViolationException) {
            return new JsonResponse(['error' => 'A grape with the same name already exists.'], Response::HTTP_CONFLICT);
        }

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/api/grapes/{id}', name: 'api_grapes_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        if (null === $this->authSession->getAuthenticatedUserId()) {
            return new JsonResponse(['error' => 'Unauthenticated.'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            $this->deleteGrapeHandler->handle($id);
        } catch (DeleteGrapeNotFound $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        } catch (DeleteGrapeHasAssociatedWines $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_CONFLICT);
        }

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * @param array<string,mixed> $payload
     */
    private function buildCreateCommand(array $payload): CreateGrapeCommand
    {
        $name = $payload['name'] ?? null;
        if (!is_string($name)) {
            throw new CreateGrapeValidationException('name is required.');
        }

        $colorRaw = $payload['color'] ?? null;
        if (!is_string($colorRaw)) {
            throw new CreateGrapeValidationException('color is required.');
        }

        try {
            $color = GrapeColor::from(strtolower(trim($colorRaw)));
        } catch (\ValueError) {
            throw new CreateGrapeValidationException('Invalid color value.');
        }

        return new CreateGrapeCommand(name: $name, color: $color);
    }

    /**
     * @param array<string,mixed> $payload
     */
    private function buildUpdateCommand(int $id, array $payload): UpdateGrapeCommand
    {
        $provided = [
            'name' => array_key_exists('name', $payload),
            'color' => array_key_exists('color', $payload),
        ];

        return new UpdateGrapeCommand(
            grapeId: $id,
            name: $this->parseNullableString($payload['name'] ?? null, 'name', $provided['name']),
            color: $this->parseColor($payload['color'] ?? null, $provided['color']),
            provided: $provided,
        );
    }

    /**
     * @return list<string>
     */
    private function parseSortFields(Request $request): array
    {
        $sortFields = [];

        foreach ([1, 2] as $position) {
            $fieldName = sprintf('sort_by_%d', $position);
            $value = $request->query->get($fieldName);

            if (null === $value || '' === trim((string) $value)) {
                continue;
            }

            if (!is_string($value)) {
                throw new \InvalidArgumentException(sprintf('%s must be a string.', $fieldName));
            }

            $normalized = trim(strtolower($value));
            if (!in_array($normalized, ListGrapesSort::ALLOWED, true)) {
                throw new \InvalidArgumentException(sprintf('Invalid %s value.', $fieldName));
            }

            if (in_array($normalized, $sortFields, true)) {
                throw new \InvalidArgumentException(sprintf('%s contains duplicate sort field "%s".', $fieldName, $normalized));
            }

            $sortFields[] = $normalized;
        }

        if ([] === $sortFields) {
            return ListGrapesSort::DEFAULT_ORDER;
        }

        foreach (ListGrapesSort::DEFAULT_ORDER as $defaultField) {
            if (!in_array($defaultField, $sortFields, true)) {
                $sortFields[] = $defaultField;
            }
        }

        return array_slice($sortFields, 0, 2);
    }

    private function parseOptionalStringFilter(Request $request, string $key): ?string
    {
        $value = $request->query->get($key);
        if (null === $value) {
            return null;
        }
        if (!is_string($value)) {
            throw new \InvalidArgumentException(sprintf('%s must be a string.', $key));
        }

        $trimmed = trim($value);
        if ('' === $trimmed) {
            return null;
        }

        return $trimmed;
    }

    private function parseColorFilter(Request $request, string $key): ?GrapeColor
    {
        $value = $request->query->get($key);
        if (null === $value || '' === trim((string) $value)) {
            return null;
        }

        if (!is_string($value)) {
            throw new \InvalidArgumentException(sprintf('%s must be a string.', $key));
        }

        try {
            return GrapeColor::from(strtolower(trim($value)));
        } catch (\ValueError) {
            throw new \InvalidArgumentException('Invalid color value.');
        }
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
            throw new UpdateGrapeValidationException(sprintf('%s must be a string or null.', $field));
        }

        return $value;
    }

    private function parseColor(mixed $value, bool $isProvided): ?GrapeColor
    {
        if (!$isProvided) {
            return null;
        }

        if (null === $value) {
            return null;
        }

        if (!is_string($value)) {
            throw new UpdateGrapeValidationException('color must be a string or null.');
        }

        try {
            return GrapeColor::from(strtolower(trim($value)));
        } catch (\ValueError) {
            throw new UpdateGrapeValidationException('Invalid color value.');
        }
    }
}
