<?php

declare(strict_types=1);

namespace App\Application\UseCases\Auth\User\DeleteUser;

use App\Domain\Repository\UserRepository;

final readonly class DeleteUserByEmailHandler
{
    public function __construct(private UserRepository $users)
    {
    }

    public function handle(DeleteUserByEmailCommand $command): void
    {
        $email = strtolower(trim($command->email));
        if ('' === $email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new DeleteUserValidationException('email must be a valid email address.');
        }

        if (!$this->users->deleteByEmail($email)) {
            throw new DeleteUserNotFound(sprintf('User not found for email %s.', $email));
        }
    }
}

