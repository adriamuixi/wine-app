<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Auth\User;

use App\Application\UseCases\Auth\User\CreateUser\CreateUserAlreadyExists;
use App\Application\UseCases\Auth\User\CreateUser\CreateUserCommand;
use App\Application\UseCases\Auth\User\CreateUser\CreateUserHandler;
use App\Application\UseCases\Auth\User\CreateUser\CreateUserValidationException;
use App\Domain\Model\AuthUser;
use App\Domain\Repository\UserRepository;
use PHPUnit\Framework\TestCase;

final class CreateUserHandlerTest extends TestCase
{
    public function testCreatesUser(): void
    {
        $repo = new SpyCreateUserRepository();
        $handler = new CreateUserHandler($repo);

        $user = $handler->handle(new CreateUserCommand('new@example.com', 'New', 'User', 'secret123'));

        self::assertSame('new@example.com', $user->email);
        self::assertNotNull($repo->createdPasswordHash);
    }

    public function testRejectsInvalidEmail(): void
    {
        $handler = new CreateUserHandler(new SpyCreateUserRepository());

        $this->expectException(CreateUserValidationException::class);
        $handler->handle(new CreateUserCommand('invalid', 'New', 'User', 'secret123'));
    }

    public function testRejectsAlreadyExistingEmail(): void
    {
        $handler = new CreateUserHandler(new SpyCreateUserRepository(existingEmail: 'exists@example.com'));

        $this->expectException(CreateUserAlreadyExists::class);
        $handler->handle(new CreateUserCommand('exists@example.com', 'A', 'B', 'secret123'));
    }
}

final class SpyCreateUserRepository implements UserRepository
{
    public ?string $createdPasswordHash = null;

    public function __construct(private readonly ?string $existingEmail = null)
    {
    }

    public function findByEmail(string $email): ?AuthUser
    {
        if (null !== $this->existingEmail && strtolower($email) === $this->existingEmail) {
            return new AuthUser(10, $this->existingEmail, 'hash', 'Exists', 'User');
        }

        return null;
    }

    public function findById(int $id): ?AuthUser
    {
        return null;
    }

    public function create(string $email, string $name, string $lastname, string $passwordHash): AuthUser
    {
        $this->createdPasswordHash = $passwordHash;

        return new AuthUser(11, strtolower($email), $passwordHash, $name, $lastname);
    }

    public function deleteByEmail(string $email): bool
    {
        return false;
    }
}
