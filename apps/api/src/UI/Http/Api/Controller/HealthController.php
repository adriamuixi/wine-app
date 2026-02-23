<?php

declare(strict_types=1);

namespace App\UI\Http\Api\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class HealthController
{
    #[Route("/api", name: "api_index", methods: ["GET"])]
    public function __invoke(): JsonResponse
    {
        return new JsonResponse([
            "status" => "ok",
            "service" => "wine-api",
        ]);
    }
}
