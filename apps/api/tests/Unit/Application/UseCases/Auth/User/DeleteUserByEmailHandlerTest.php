<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Auth\User;

use App\Application\UseCases\Auth\User\DeleteUser\DeleteUserByEmailCommand;
use App\Application\UseCases\Auth\User\DeleteUser\DeleteUserByEmailHandler;
use App\Application\UseCases\Auth\User\DeleteUser\DeleteUserNotFound;
use App\Application\UseCases\Auth\User\DeleteUser\DeleteUserValidationException;
use App\Domain\Model\AuthUser;
use App\Domain\Repository\UserRepository;
use PHPUnit\Framework\TestCase;

final class DeleteUserByEmailHandlerTest extends TestCase
{
    public function testDeletesUserByEmail(): void
    {
        $repo = new SpyDeleteUserRepository(deletableEmail: 'test@example.com');
        $handler = new DeleteUserByEmailHandler($repo);

        $handler->handle(new DeleteUserByEmailCommand('test@example.com'));

        self::assertSame('test@example.com', $repo->deletedEmail);
    }

    public function testRejectsInvalidEmail(): void
    {
        $handler = new DeleteUserByEmailHandler(new SpyDeleteUserRepository(null));

        $this->expectException(DeleteUserValidationException::class);
        $handler->handle(new DeleteUserByEmailCommand('not-an-email'));
    }

    public function testThrowsWhenUserNotFound(): void
    {
        $handler = new DeleteUserByEmailHandler(new SpyDeleteUserRepository(deletableEmail: null));

        $this->expectException(DeleteUserNotFound::class);
        $handler->handle(new DeleteUserByEmailCommand('missing@example.com'));
    }
}

final class SpyDeleteUserRepository implements UserRepository
{
    public ?string $deletedEmail = null;

    public function __construct(private readonly ?string $deletableEmail)
    {
    }

    public function findByEmail(string $email): ?AuthUser
    {
        return null;
    }

    public function findById(int $id): ?AuthUser
    {
        return null;
    }

    public function create(string $email, string $name, string $lastname, string $passwordHash): AuthUser
    {
        return new AuthUser(1, $email, $passwordHash, $name, $lastname);
    }

    public function deleteByEmail(string $email): bool
    {
        $normalized = strtolower($email);
        if (null !== $this->deletableEmail && $normalized === $this->deletableEmail) {
            $this->deletedEmail = $normalized;
            return true;
        }

        return false;
    }
}
