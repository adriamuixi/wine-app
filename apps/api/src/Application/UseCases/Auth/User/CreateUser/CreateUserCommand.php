<?php

declare(strict_types=1);

namespace App\Application\UseCases\Auth\User\CreateUser;

final readonly class CreateUserCommand
{
    public function __construct(
        public string $email,
        public string $name,
        public string $lastname,
        public string $password,
    ) {
    }
}

