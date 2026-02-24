<?php

declare(strict_types=1);

namespace App\Application\Ports;

interface PasswordVerifier
{
    public function verify(string $plainPassword, string $passwordHash): bool;
}
