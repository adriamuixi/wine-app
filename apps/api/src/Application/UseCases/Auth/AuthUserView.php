<?php

declare(strict_types=1);

namespace App\Application\UseCases\Auth;

final readonly class AuthUserView
{
    public function __construct(
        public int $id,
        public string $email,
        public string $name,
        public string $lastname,
    ) {
    }
}
