<?php

declare(strict_types=1);

namespace App\Application\UseCases\Auth\Login;

use App\Application\Ports\AuthSessionManager;
use App\Application\Ports\PasswordVerifier;
use App\Domain\Model\AuthUser;
use App\Domain\Repository\UserRepository;

final readonly class LoginHandler
{
    public function __construct(
        private UserRepository $users,
        private PasswordVerifier $passwordVerifier,
        private AuthSessionManager $authSession,
    ) {
    }

    public function handle(LoginCommand $command): AuthUser
    {
        $credentials = $this->users->findByEmail(strtolower(trim($command->email)));

        if (null === $credentials) {
            throw new InvalidCredentials('Invalid credentials.');
        }

        if (null === $credentials->passwordHash) {
            throw new InvalidCredentials('Invalid credentials.');
        }

        if (!$this->passwordVerifier->verify($command->password, $credentials->passwordHash)) {
            throw new InvalidCredentials('Invalid credentials.');
        }

        $this->authSession->loginByUserId($credentials->id);

        return new AuthUser(
            $credentials->id,
            $credentials->email,
            null,
            $credentials->name,
            $credentials->lastname,
        );
    }
}
