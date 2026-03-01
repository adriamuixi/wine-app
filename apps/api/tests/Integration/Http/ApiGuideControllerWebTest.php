<?php

declare(strict_types=1);

namespace App\Tests\Integration\Http;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

final class ApiGuideControllerWebTest extends WebTestCase
{
    public function testGuideEndpointReturnsMarkdown(): void
    {
        $client = static::createClient(['environment' => 'test', 'debug' => true]);

        $client->request('GET', '/guide.md');

        self::assertResponseStatusCodeSame(Response::HTTP_OK);
        self::assertResponseHeaderSame('content-type', 'text/markdown; charset=UTF-8');

        $content = (string) $client->getResponse()->getContent();
        self::assertStringContainsString('# Wine App API Guide', $content);
        self::assertStringContainsString('POST /api/auth/login', $content);
    }
}
