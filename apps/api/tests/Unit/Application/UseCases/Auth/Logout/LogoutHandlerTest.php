<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Auth\Logout;

use App\Application\UseCases\Auth\Logout\LogoutHandler;
use App\Tests\Unit\Application\UseCases\Auth\Login\SpyAuthSessionManager;
use PHPUnit\Framework\TestCase;

final class LogoutHandlerTest extends TestCase
{
    public function testItDelegatesLogoutToSessionManager(): void
    {
        $session = new SpyAuthSessionManager();
        $handler = new LogoutHandler($session);

        $handler->handle();

        self::assertTrue($session->loggedOut);
    }
}
