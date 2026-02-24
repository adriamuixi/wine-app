<?php

declare(strict_types=1);

namespace App\Adapters\Out\Security;

use App\Application\Ports\PasswordVerifier;

final class NativePasswordVerifier implements PasswordVerifier
{
    public function verify(string $plainPassword, string $passwordHash): bool
    {
        return password_verify($plainPassword, $passwordHash);
    }
}
