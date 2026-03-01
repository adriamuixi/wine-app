<?php

declare(strict_types=1);

namespace App\Adapters\In\Http;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class ApiGuideController
{
    #[Route('/guide.md', name: 'api_guide_markdown', methods: ['GET'])]
    public function __invoke(): Response
    {
        $guidePath = $this->resolveGuidePath();
        if (null === $guidePath) {
            return new Response('Guide not found.', Response::HTTP_NOT_FOUND, [
                'Content-Type' => 'text/plain; charset=UTF-8',
            ]);
        }

        $content = file_get_contents($guidePath);
        if (false === $content) {
            return new Response('Guide not readable.', Response::HTTP_INTERNAL_SERVER_ERROR, [
                'Content-Type' => 'text/plain; charset=UTF-8',
            ]);
        }

        return new Response($content, Response::HTTP_OK, [
            'Content-Type' => 'text/markdown; charset=UTF-8',
        ]);
    }

    private function resolveGuidePath(): ?string
    {
        $candidates = [
            '/docs/api/API_GUIDE.md',
            dirname(__DIR__, 6).'/docs/api/API_GUIDE.md',
            dirname(__DIR__, 4).'/docs/api/API_GUIDE.md',
        ];

        foreach ($candidates as $path) {
            if (is_file($path)) {
                return $path;
            }
        }

        return null;
    }
}
