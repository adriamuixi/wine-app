<?php

declare(strict_types=1);

namespace App\Application\UseCases\Auth\Me;

use App\Application\Ports\AuthSessionManager;
use App\Application\Ports\UserRepository;
use App\Application\UseCases\Auth\AuthUserView;

final readonly class GetCurrentUserHandler
{
    public function __construct(
        private AuthSessionManager $authSession,
        private UserRepository $users,
    ) {
    }

    public function handle(): ?AuthUserView
    {
        $userId = $this->authSession->getAuthenticatedUserId();
        if (null === $userId) {
            return null;
        }

        return $this->users->findAuthUserById($userId);
    }
}
