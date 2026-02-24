<?php

declare(strict_types=1);

namespace App\Application\Ports;

interface AuthSessionManager
{
    public function loginByUserId(int $userId): void;

    public function getAuthenticatedUserId(): ?int;

    public function logout(): void;
}
