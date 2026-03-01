<?php

declare(strict_types=1);

namespace App\Application\UseCases\Auth\User\CreateUser;

use App\Domain\Model\AuthUser;
use App\Domain\Repository\UserRepository;

final readonly class CreateUserHandler
{
    public function __construct(private UserRepository $users)
    {
    }

    public function handle(CreateUserCommand $command): AuthUser
    {
        $email = strtolower(trim($command->email));
        $name = trim($command->name);
        $lastname = trim($command->lastname);
        $password = $command->password;

        if ('' === $email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new CreateUserValidationException('email must be a valid email address.');
        }
        if ('' === $name) {
            throw new CreateUserValidationException('name is required.');
        }
        if ('' === $lastname) {
            throw new CreateUserValidationException('lastname is required.');
        }
        if ('' === $password) {
            throw new CreateUserValidationException('password is required.');
        }

        if (null !== $this->users->findByEmail($email)) {
            throw new CreateUserAlreadyExists(sprintf('User already exists for email %s.', $email));
        }

        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        if (false === $passwordHash) {
            throw new \RuntimeException('Unable to hash password.');
        }

        return $this->users->create($email, $name, $lastname, $passwordHash);
    }
}
