<?php

declare(strict_types=1);

namespace App\Application\UseCases\Auth\Token;

use App\Application\Ports\AccessTokenManager;
use App\Application\Ports\PasswordVerifier;
use App\Application\UseCases\Auth\Login\InvalidCredentials;
use App\Domain\Model\AuthUser;
use App\Domain\Repository\UserRepository;

final readonly class IssueAuthTokenHandler
{
    public function __construct(
        private UserRepository $users,
        private PasswordVerifier $passwordVerifier,
        private AccessTokenManager $accessTokens,
    ) {
    }

    public function handle(IssueAuthTokenCommand $command): IssueAuthTokenResult
    {
        $credentials = $this->users->findByEmail(strtolower(trim($command->email)));

        if (null === $credentials || null === $credentials->passwordHash) {
            throw new InvalidCredentials('Invalid credentials.');
        }

        if (!$this->passwordVerifier->verify($command->password, $credentials->passwordHash)) {
            throw new InvalidCredentials('Invalid credentials.');
        }

        $user = new AuthUser(
            $credentials->id,
            $credentials->email,
            null,
            $credentials->name,
            $credentials->lastname,
        );

        $issuedToken = $this->accessTokens->issueToken($user);

        return new IssueAuthTokenResult(
            user: $user,
            token: $issuedToken->token,
            expiresAt: $issuedToken->expiresAt,
        );
    }
}
