<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Auth\User;

use App\Application\Ports\AuthSessionManager;
use App\Application\UseCases\Auth\User\UpdateCurrentUser\UpdateCurrentUserCommand;
use App\Application\UseCases\Auth\User\UpdateCurrentUser\UpdateCurrentUserHandler;
use App\Application\UseCases\Auth\User\UpdateCurrentUser\UpdateCurrentUserUnauthenticated;
use App\Application\UseCases\Auth\User\UpdateCurrentUser\UpdateCurrentUserValidationException;
use App\Domain\Model\AuthUser;
use App\Domain\Repository\UserRepository;
use PHPUnit\Framework\TestCase;

final class UpdateCurrentUserHandlerTest extends TestCase
{
    public function testUpdatesCurrentUserProfile(): void
    {
        $repo = new SpyUpdateUserRepository();
        $session = new SpyUpdateCurrentUserSessionManager();
        $session->authenticatedUserId = 1;
        $handler = new UpdateCurrentUserHandler($session, $repo);

        $user = $handler->handle(new UpdateCurrentUserCommand('Adria', 'Muixi', 'secret1234'));

        self::assertSame('Adria', $user->name);
        self::assertSame('Muixi', $user->lastname);
        self::assertSame(1, $repo->updatedId);
        self::assertNotNull($repo->updatedPasswordHash);
    }

    public function testRejectsMissingSession(): void
    {
        $handler = new UpdateCurrentUserHandler(new SpyUpdateCurrentUserSessionManager(), new SpyUpdateUserRepository());

        $this->expectException(UpdateCurrentUserUnauthenticated::class);
        $handler->handle(new UpdateCurrentUserCommand('Adria', 'Muixi', null));
    }

    public function testRejectsBlankName(): void
    {
        $repo = new SpyUpdateUserRepository();
        $session = new SpyUpdateCurrentUserSessionManager();
        $session->authenticatedUserId = 1;
        $handler = new UpdateCurrentUserHandler($session, $repo);

        $this->expectException(UpdateCurrentUserValidationException::class);
        $handler->handle(new UpdateCurrentUserCommand(' ', 'Muixi', null));
    }
}

final class SpyUpdateUserRepository implements UserRepository
{
    public ?int $updatedId = null;
    public ?string $updatedPasswordHash = null;

    public function findByEmail(string $email): ?AuthUser
    {
        return null;
    }

    public function findById(int $id): ?AuthUser
    {
        return new AuthUser($id, 'demo@example.com', null, 'Demo', 'User');
    }

    public function create(string $email, string $name, string $lastname, string $passwordHash): AuthUser
    {
        return new AuthUser(1, $email, $passwordHash, $name, $lastname);
    }

    public function update(int $id, string $name, string $lastname, ?string $passwordHash): ?AuthUser
    {
        $this->updatedId = $id;
        $this->updatedPasswordHash = $passwordHash;

        return new AuthUser($id, 'demo@example.com', $passwordHash, $name, $lastname);
    }

    public function deleteByEmail(string $email): bool
    {
        return false;
    }
}

final class SpyUpdateCurrentUserSessionManager implements AuthSessionManager
{
    public ?int $authenticatedUserId = null;

    public function loginByUserId(int $userId): void
    {
    }

    public function getAuthenticatedUserId(): ?int
    {
        return $this->authenticatedUserId;
    }

    public function logout(): void
    {
    }
}
