<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Auth\Token;

use App\Application\Ports\AccessTokenClaims;
use App\Application\Ports\AccessTokenManager;
use App\Application\Ports\IssuedAccessToken;
use App\Application\UseCases\Auth\Login\InvalidCredentials;
use App\Application\UseCases\Auth\Token\IssueAuthTokenCommand;
use App\Application\UseCases\Auth\Token\IssueAuthTokenHandler;
use App\Domain\Model\AuthUser;
use App\Domain\Repository\UserRepository;
use PHPUnit\Framework\TestCase;

final class IssueAuthTokenHandlerTest extends TestCase
{
    public function testItIssuesTokenForValidCredentials(): void
    {
        $handler = new IssueAuthTokenHandler(
            new TokenTestInMemoryUserRepository(),
            new TokenTestPasswordVerifier(true),
            new TokenTestAccessTokenManager(),
        );

        $result = $handler->handle(new IssueAuthTokenCommand('Demo@example.com', 'secret'));

        self::assertSame('demo@example.com', $result->user->email);
        self::assertSame('issued-access-token', $result->token);
    }

    public function testItRejectsInvalidCredentials(): void
    {
        $handler = new IssueAuthTokenHandler(
            new TokenTestInMemoryUserRepository(),
            new TokenTestPasswordVerifier(false),
            new TokenTestAccessTokenManager(),
        );

        $this->expectException(InvalidCredentials::class);

        $handler->handle(new IssueAuthTokenCommand('demo@example.com', 'wrong'));
    }
}

final class TokenTestInMemoryUserRepository implements UserRepository
{
    public function findByEmail(string $email): ?AuthUser
    {
        if ('demo@example.com' !== strtolower($email)) {
            return null;
        }

        return new AuthUser(1, 'demo@example.com', 'hashed', 'Demo', 'User');
    }

    public function findById(int $id): ?AuthUser
    {
        return 1 === $id ? new AuthUser(1, 'demo@example.com', null, 'Demo', 'User') : null;
    }

    public function create(string $email, string $name, string $lastname, string $passwordHash): AuthUser
    {
        return new AuthUser(2, strtolower($email), $passwordHash, $name, $lastname);
    }

    public function update(int $id, string $name, string $lastname, ?string $passwordHash): ?AuthUser
    {
        return new AuthUser($id, 'demo@example.com', null, $name, $lastname);
    }

    public function deleteByEmail(string $email): bool
    {
        return true;
    }
}

final class TokenTestPasswordVerifier implements \App\Application\Ports\PasswordVerifier
{
    public function __construct(private readonly bool $result)
    {
    }

    public function verify(string $plainPassword, string $passwordHash): bool
    {
        return $this->result;
    }
}

final class TokenTestAccessTokenManager implements AccessTokenManager
{
    public function issueToken(AuthUser $user): IssuedAccessToken
    {
        return new IssuedAccessToken('issued-access-token', new \DateTimeImmutable('2030-01-01T00:00:00+00:00'));
    }

    public function parseToken(string $token): ?AccessTokenClaims
    {
        return null;
    }
}
