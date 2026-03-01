<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Auth\Login;

use App\Application\Ports\AuthSessionManager;
use App\Application\Ports\PasswordVerifier;
use App\Domain\Model\AuthUser;
use App\Domain\Repository\UserRepository;
use App\Application\UseCases\Auth\Login\InvalidCredentials;
use App\Application\UseCases\Auth\Login\LoginCommand;
use App\Application\UseCases\Auth\Login\LoginHandler;
use PHPUnit\Framework\TestCase;

final class LoginHandlerTest extends TestCase
{
    public function testItLogsInWithValidCredentials(): void
    {
        $userRepo = new InMemoryUserRepository();
        $passwordVerifier = new StubPasswordVerifier(true);
        $session = new SpyAuthSessionManager();

        $handler = new LoginHandler($userRepo, $passwordVerifier, $session);

        $result = $handler->handle(new LoginCommand('Demo@Example.com', 'secret'));

        self::assertSame(1, $result->id);
        self::assertSame('demo@example.com', $result->email);
        self::assertSame(1, $session->loggedInUserId);
    }

    public function testItRejectsUnknownUser(): void
    {
        $handler = new LoginHandler(
            new InMemoryUserRepository(null),
            new StubPasswordVerifier(true),
            new SpyAuthSessionManager(),
        );

        $this->expectException(InvalidCredentials::class);
        $handler->handle(new LoginCommand('missing@example.com', 'secret'));
    }

    public function testItRejectsInvalidPassword(): void
    {
        $handler = new LoginHandler(
            new InMemoryUserRepository(),
            new StubPasswordVerifier(false),
            new SpyAuthSessionManager(),
        );

        $this->expectException(InvalidCredentials::class);
        $handler->handle(new LoginCommand('demo@example.com', 'wrong'));
    }
}

final class InMemoryUserRepository implements UserRepository
{
    private int $lastId = 1;

    public function __construct(
        private readonly ?AuthUser $user = new AuthUser(1, 'demo@example.com', 'hashed', 'Demo', 'User'),
    ) {
    }

    public function findByEmail(string $email): ?AuthUser
    {
        if (null === $this->user) {
            return null;
        }

        return strtolower($email) === $this->user->email ? $this->user : null;
    }

    public function findById(int $id): ?AuthUser
    {
        if (null === $this->user || $this->user->id !== $id) {
            return null;
        }

        return new AuthUser(
            $this->user->id,
            $this->user->email,
            null,
            $this->user->name,
            $this->user->lastname,
        );
    }

    public function create(string $email, string $name, string $lastname, string $passwordHash): AuthUser
    {
        $this->lastId += 1;

        return new AuthUser($this->lastId, strtolower($email), $passwordHash, $name, $lastname);
    }

    public function deleteByEmail(string $email): bool
    {
        return null !== $this->user && strtolower($email) === $this->user->email;
    }
}

final class StubPasswordVerifier implements PasswordVerifier
{
    public function __construct(private readonly bool $result)
    {
    }

    public function verify(string $plainPassword, string $passwordHash): bool
    {
        return $this->result;
    }
}

final class SpyAuthSessionManager implements AuthSessionManager
{
    public ?int $loggedInUserId = null;
    public bool $loggedOut = false;
    public ?int $authenticatedUserId = null;

    public function loginByUserId(int $userId): void
    {
        $this->loggedInUserId = $userId;
    }

    public function getAuthenticatedUserId(): ?int
    {
        return $this->authenticatedUserId;
    }

    public function logout(): void
    {
        $this->loggedOut = true;
    }
}
