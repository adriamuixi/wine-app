<?php

declare(strict_types=1);

namespace App\Application\UseCases\Auth;

final readonly class AuthUserCredentials
{
    public function __construct(
        public int $id,
        public string $email,
        public string $passwordHash,
        public string $name,
        public string $lastname,
    ) {
    }

    public function toUserView(): AuthUserView
    {
        return new AuthUserView(
            $this->id,
            $this->email,
            $this->name,
            $this->lastname,
        );
    }
}
