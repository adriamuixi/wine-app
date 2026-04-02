<?php

declare(strict_types=1);

namespace App\Application\UseCases\Auth\Token;

use App\Domain\Model\AuthUser;

final readonly class IssueAuthTokenResult
{
    public function __construct(
        public AuthUser $user,
        public string $token,
        public \DateTimeImmutable $expiresAt,
    ) {
    }
}
