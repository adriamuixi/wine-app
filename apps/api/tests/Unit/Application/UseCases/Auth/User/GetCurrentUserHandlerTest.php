<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Auth\User;

use App\Application\UseCases\Auth\User\GetCurrentUserHandler;
use App\Tests\Unit\Application\UseCases\Auth\Login\InMemoryUserRepository;
use App\Tests\Unit\Application\UseCases\Auth\Login\SpyAuthSessionManager;
use PHPUnit\Framework\TestCase;

final class GetCurrentUserHandlerTest extends TestCase
{
    public function testItReturnsNullWhenUnauthenticated(): void
    {
        $session = new SpyAuthSessionManager();
        $handler = new GetCurrentUserHandler($session, new InMemoryUserRepository());

        self::assertNull($handler->handle());
    }

    public function testItReturnsCurrentUserWhenAuthenticated(): void
    {
        $session = new SpyAuthSessionManager();
        $session->authenticatedUserId = 1;

        $handler = new GetCurrentUserHandler($session, new InMemoryUserRepository());
        $user = $handler->handle();

        self::assertNotNull($user);
        self::assertSame('demo@example.com', $user->email);
    }
}
