<?php

declare(strict_types=1);

namespace App\Application\Ports;

use App\Domain\Model\AuthUser;

interface AccessTokenManager
{
    public function issueToken(AuthUser $user): IssuedAccessToken;

    public function parseToken(string $token): ?AccessTokenClaims;
}
