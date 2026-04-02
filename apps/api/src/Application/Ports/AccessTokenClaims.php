<?php

declare(strict_types=1);

namespace App\Application\Ports;

final readonly class AccessTokenClaims
{
    public function __construct(
        public int $userId,
        public string $email,
        public \DateTimeImmutable $expiresAt,
    ) {
    }
}
