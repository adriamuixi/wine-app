<?php

declare(strict_types=1);

namespace App\Application\UseCases\Auth\User;

use App\Application\Ports\AuthSessionManager;
use App\Domain\Model\AuthUser;
use App\Domain\Repository\UserRepository;

final readonly class GetCurrentUserHandler
{
    public function __construct(
        private AuthSessionManager $authSession,
        private UserRepository $users,
    ) {
    }

    public function handle(): ?AuthUser
    {
        $userId = $this->authSession->getAuthenticatedUserId();
        if (null === $userId) {
            return null;
        }

        $user = $this->users->findAuthUserById($userId);
        if (null === $user) {
            return null;
        }

        return $user;
    }
}
