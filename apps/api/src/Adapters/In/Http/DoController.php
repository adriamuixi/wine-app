<?php

declare(strict_types=1);

namespace App\Adapters\In\Http;

use App\Application\UseCases\Do\ListDos\ListDosHandler;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class DoController
{
    public function __construct(private readonly ListDosHandler $listDosHandler)
    {
    }

    #[Route('/api/dos', name: 'api_dos_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $items = $this->listDosHandler->handle();

        return new JsonResponse([
            'items' => array_map(
                static fn ($do): array => [
                    'id' => $do->id,
                    'name' => $do->name,
                    'region' => $do->region,
                    'country' => $do->country->value,
                    'country_code' => $do->countryCode,
                ],
                $items,
            ),
        ], Response::HTTP_OK);
    }
}

