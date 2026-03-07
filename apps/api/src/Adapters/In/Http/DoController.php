<?php

declare(strict_types=1);

namespace App\Adapters\In\Http;

use App\Application\UseCases\Do\ListDos\ListDosHandler;
use App\Application\UseCases\Do\ListDos\ListDosQuery;
use App\Application\UseCases\Do\ListDos\ListDosSort;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class DoController
{
    public function __construct(private readonly ListDosHandler $listDosHandler)
    {
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
}
