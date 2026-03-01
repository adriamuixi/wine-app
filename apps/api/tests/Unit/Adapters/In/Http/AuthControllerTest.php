<?php

declare(strict_types=1);

namespace App\Tests\Unit\Adapters\In\Http;

use App\Adapters\In\Http\AuthController;
use App\Domain\Model\AuthUser;
use App\Application\UseCases\Auth\Login\LoginHandler;
use App\Application\UseCases\Auth\Logout\LogoutHandler;
use App\Application\UseCases\Auth\User\GetCurrentUserHandler;
use App\Tests\Unit\Application\UseCases\Auth\Login\InMemoryUserRepository;
use App\Tests\Unit\Application\UseCases\Auth\Login\SpyAuthSessionManager;
use App\Tests\Unit\Application\UseCases\Auth\Login\StubPasswordVerifier;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

final class AuthControllerTest extends TestCase
{
    public function testLoginReturnsBadRequestForInvalidJson(): void
    {
        $controller = $this->controller();
        $request = Request::create('/api/auth/login', 'POST', server: ['CONTENT_TYPE' => 'application/json'], content: '{');

        $response = $controller->login($request);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testLoginReturnsUnauthorizedForInvalidCredentials(): void
    {
        $controller = $this->controller(passwordOk: false);
        $request = Request::create(
            '/api/auth/login',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['email' => 'demo@example.com', 'password' => 'wrong'], JSON_THROW_ON_ERROR),
        );

        $response = $controller->login($request);

        self::assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
    }

    public function testLoginReturnsUserPayloadOnSuccess(): void
    {
        $controller = $this->controller();
        $request = Request::create(
            '/api/auth/login',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['email' => 'demo@example.com', 'password' => 'demo1234'], JSON_THROW_ON_ERROR),
        );

        $response = $controller->login($request);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame('demo@example.com', $payload['user']['email']);
    }

    public function testMeReturnsUnauthorizedWithoutSession(): void
    {
        $controller = $this->controller();
        $response = $controller->me();

        self::assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
    }

    public function testMeReturnsCurrentUserWhenAuthenticated(): void
    {
        $controller = $this->controller(authenticatedUserId: 1);
        $response = $controller->me();
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame(1, $payload['user']['id']);
    }

    public function testLogoutReturnsNoContent(): void
    {
        $controller = $this->controller();
        $response = $controller->logout();

        self::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());
    }

    private function controller(bool $passwordOk = true, ?int $authenticatedUserId = null): AuthController
    {
        $repo = new InMemoryUserRepository(new AuthUser(1, 'demo@example.com', 'hash', 'Demo', 'User'));
        $session = new SpyAuthSessionManager();
        $session->authenticatedUserId = $authenticatedUserId;

        return new AuthController(
            new LoginHandler($repo, new StubPasswordVerifier($passwordOk), $session),
            new GetCurrentUserHandler($session, $repo),
            new LogoutHandler($session),
        );
    }
}
