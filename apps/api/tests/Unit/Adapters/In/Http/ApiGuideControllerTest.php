<?php

declare(strict_types=1);

namespace App\Tests\Unit\Adapters\In\Http;

use App\Adapters\In\Http\ApiGuideController;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Response;

final class ApiGuideControllerTest extends TestCase
{
    public function testItReturnsMarkdownGuide(): void
    {
        $controller = new ApiGuideController();

        $response = $controller->__invoke();

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertStringContainsString('text/markdown', (string) $response->headers->get('Content-Type'));

        $content = (string) $response->getContent();
        self::assertStringContainsString('# Wine App API Guide', $content);
        self::assertStringContainsString('GET /api/wines', $content);
        self::assertStringContainsString('GET /guide.md', $content);
    }
}
