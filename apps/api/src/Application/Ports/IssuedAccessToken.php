<?php

declare(strict_types=1);

namespace App\Application\Ports;

final readonly class IssuedAccessToken
{
    public function __construct(
        public string $token,
        public \DateTimeImmutable $expiresAt,
    ) {
    }
}
