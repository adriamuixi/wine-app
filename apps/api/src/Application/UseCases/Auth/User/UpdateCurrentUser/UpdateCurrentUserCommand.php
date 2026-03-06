<?php

declare(strict_types=1);

namespace App\Application\UseCases\Auth\User\UpdateCurrentUser;

final readonly class UpdateCurrentUserCommand
{
    public function __construct(
        public string $name,
        public string $lastname,
        public ?string $password = null,
    ) {
    }
}
