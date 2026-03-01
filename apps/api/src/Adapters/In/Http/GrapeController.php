<?php

declare(strict_types=1);

namespace App\Adapters\In\Http;

use App\Application\UseCases\Grape\ListGrapes\ListGrapesHandler;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class GrapeController
{
    public function __construct(private readonly ListGrapesHandler $listGrapesHandler)
    {
    }

    #[Route('/api/grapes', name: 'api_grapes_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $items = $this->listGrapesHandler->handle();

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
}
