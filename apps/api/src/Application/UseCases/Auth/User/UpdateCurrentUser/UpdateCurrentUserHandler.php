<?php

declare(strict_types=1);

namespace App\Application\UseCases\Auth\User\UpdateCurrentUser;

use App\Application\Ports\AuthSessionManager;
use App\Domain\Model\AuthUser;
use App\Domain\Repository\UserRepository;

final readonly class UpdateCurrentUserHandler
{
    public function __construct(
        private AuthSessionManager $authSession,
        private UserRepository $users,
    ) {
    }

    public function handle(UpdateCurrentUserCommand $command): AuthUser
    {
        $authenticatedUserId = $this->authSession->getAuthenticatedUserId();
        if (null === $authenticatedUserId) {
            throw new UpdateCurrentUserUnauthenticated('Unauthenticated.');
        }

        $name = trim($command->name);
        $lastname = trim($command->lastname);
        $password = null === $command->password ? null : trim($command->password);

        if ('' === $name) {
            throw new UpdateCurrentUserValidationException('name is required.');
        }

        if ('' === $lastname) {
            throw new UpdateCurrentUserValidationException('lastname is required.');
        }

        $passwordHash = null;
        if (null !== $password) {
            if ('' === $password) {
                throw new UpdateCurrentUserValidationException('password cannot be empty when provided.');
            }

            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            if (false === $passwordHash) {
                throw new \RuntimeException('Unable to hash password.');
            }
        }

        $updated = $this->users->update($authenticatedUserId, $name, $lastname, $passwordHash);
        if (null === $updated) {
            throw new UpdateCurrentUserNotFound(sprintf('User %d not found.', $authenticatedUserId));
        }

        return $updated;
    }
}
