<?php

declare(strict_types=1);

namespace App\Application\UseCases\Auth\Token;

final readonly class IssueAuthTokenCommand
{
    public function __construct(
        public string $email,
        public string $password,
    ) {
    }
}
