<?php

declare(strict_types=1);

namespace App\Application\UseCases\Auth\Logout;

use App\Application\Ports\AuthSessionManager;

final readonly class LogoutHandler
{
    public function __construct(private AuthSessionManager $authSession)
    {
    }

    public function handle(): void
    {
        $this->authSession->logout();
    }
}
