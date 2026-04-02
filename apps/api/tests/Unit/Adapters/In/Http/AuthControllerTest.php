<?php

declare(strict_types=1);

namespace App\Tests\Unit\Adapters\In\Http;

use App\Adapters\In\Http\AuthController;
use App\Application\Ports\AccessTokenClaims;
use App\Application\Ports\AccessTokenManager;
use App\Application\UseCases\Auth\User\CreateUser\CreateUserHandler;
use App\Application\UseCases\Auth\User\DeleteUser\DeleteUserByEmailHandler;
use App\Domain\Model\AuthUser;
use App\Application\UseCases\Auth\Login\LoginHandler;
use App\Application\UseCases\Auth\Logout\LogoutHandler;
use App\Application\Ports\AuthSessionManager;
use App\Application\Ports\IssuedAccessToken;
use App\Application\Ports\PasswordVerifier;
use App\Application\UseCases\Auth\Token\IssueAuthTokenHandler;
use App\Application\UseCases\Auth\User\GetCurrentUserHandler;
use App\Application\UseCases\Auth\User\UpdateCurrentUser\UpdateCurrentUserHandler;
use App\Domain\Repository\UserRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

final class AuthControllerTest extends TestCase
{
    public function testLoginReturnsBadRequestForInvalidJson(): void
    {
        $controller = $this->controller();
        $request = Request::create('/api/auth/login', 'POST', server: ['CONTENT_TYPE' => 'application/json'], content: '{');

        $response = $controller->login($request);

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testLoginReturnsUnauthorizedForInvalidCredentials(): void
    {
        $controller = $this->controller(passwordOk: false);
        $request = Request::create(
            '/api/auth/login',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['email' => 'demo@example.com', 'password' => 'wrong'], JSON_THROW_ON_ERROR),
        );

        $response = $controller->login($request);

        self::assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
    }

    public function testLoginReturnsUserPayloadOnSuccess(): void
    {
        $controller = $this->controller();
        $request = Request::create(
            '/api/auth/login',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['email' => 'demo@example.com', 'password' => 'demo1234'], JSON_THROW_ON_ERROR),
        );

        $response = $controller->login($request);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame('demo@example.com', $payload['user']['email']);
    }

    public function testTokenReturnsBearerPayloadOnSuccess(): void
    {
        $controller = $this->controller();
        $request = Request::create(
            '/api/auth/token',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['email' => 'demo@example.com', 'password' => 'demo1234'], JSON_THROW_ON_ERROR),
        );

        $response = $controller->token($request);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame('issued-token', $payload['access_token']);
        self::assertSame('Bearer', $payload['token_type']);
        self::assertSame('demo@example.com', $payload['user']['email']);
    }

    public function testMeReturnsUnauthorizedWithoutSession(): void
    {
        $controller = $this->controller();
        $response = $controller->me();

        self::assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
    }

    public function testMeReturnsCurrentUserWhenAuthenticated(): void
    {
        $controller = $this->controller(authenticatedUserId: 1);
        $response = $controller->me();
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame(1, $payload['user']['id']);
    }

    public function testLogoutReturnsNoContent(): void
    {
        $controller = $this->controller();
        $response = $controller->logout();

        self::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());
    }

    public function testCreateUserReturnsCreated(): void
    {
        $controller = $this->controller(authenticatedUserId: 1);
        $request = Request::create(
            '/api/auth/users',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'email' => 'new@example.com',
                'name' => 'New',
                'lastname' => 'User',
                'password' => 'secret123',
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->createUser($request);

        self::assertSame(Response::HTTP_CREATED, $response->getStatusCode());
    }

    public function testCreateUserReturnsUnauthorizedWithoutSession(): void
    {
        $controller = $this->controller(authenticatedUserId: null);
        $request = Request::create(
            '/api/auth/users',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'email' => 'new@example.com',
                'name' => 'New',
                'lastname' => 'User',
                'password' => 'secret123',
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->createUser($request);

        self::assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
    }

    public function testDeleteUserReturnsNoContent(): void
    {
        $controller = $this->controller(authenticatedUserId: 1);
        $request = Request::create(
            '/api/auth/users',
            'DELETE',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['email' => 'demo@example.com'], JSON_THROW_ON_ERROR),
        );

        $response = $controller->deleteUser($request);

        self::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());
    }

    public function testUpdateCurrentUserReturnsUpdatedPayload(): void
    {
        $controller = $this->controller(authenticatedUserId: 1);
        $request = Request::create(
            '/api/auth/me',
            'PUT',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'name' => 'Adria',
                'lastname' => 'Muixi',
                'password' => 'newSecret123',
            ], JSON_THROW_ON_ERROR),
        );

        $response = $controller->updateCurrentUser($request);
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame('Adria', $payload['user']['name']);
        self::assertSame('Muixi', $payload['user']['lastname']);
    }

    private function controller(bool $passwordOk = true, ?int $authenticatedUserId = null): AuthController
    {
        $repo = new InMemoryUserRepository(new AuthUser(1, 'demo@example.com', 'hash', 'Demo', 'User'));
        $session = new SpyAuthSessionManagerForAuthController();
        $session->authenticatedUserId = $authenticatedUserId;
        $passwordVerifier = new StubPasswordVerifier($passwordOk);

        return new AuthController(
            new LoginHandler($repo, $passwordVerifier, $session),
            new IssueAuthTokenHandler($repo, $passwordVerifier, new StubAccessTokenManager()),
            new GetCurrentUserHandler($session, $repo),
            new LogoutHandler($session),
            new CreateUserHandler($repo),
            new DeleteUserByEmailHandler($repo),
            new UpdateCurrentUserHandler($session, $repo),
            $session,
        );
    }
}

final class InMemoryUserRepository implements UserRepository
{
    private ?AuthUser $currentUser;
    private int $lastId = 1;

    public function __construct(?AuthUser $user = null)
    {
        $this->currentUser = $user;
        if (null !== $user) {
            $this->lastId = $user->id;
        }
    }

    public function findByEmail(string $email): ?AuthUser
    {
        if (null === $this->currentUser) {
            return null;
        }

        return strtolower($email) === $this->currentUser->email ? $this->currentUser : null;
    }

    public function findById(int $id): ?AuthUser
    {
        if (null === $this->currentUser || $this->currentUser->id !== $id) {
            return null;
        }

        return new AuthUser(
            $this->currentUser->id,
            $this->currentUser->email,
            null,
            $this->currentUser->name,
            $this->currentUser->lastname,
        );
    }

    public function create(string $email, string $name, string $lastname, string $passwordHash): AuthUser
    {
        $this->lastId += 1;
        $this->currentUser = new AuthUser($this->lastId, strtolower($email), $passwordHash, $name, $lastname);

        return $this->currentUser;
    }

    public function update(int $id, string $name, string $lastname, ?string $passwordHash): ?AuthUser
    {
        if (null === $this->currentUser || $this->currentUser->id !== $id) {
            return null;
        }

        $this->currentUser = new AuthUser(
            $id,
            $this->currentUser->email,
            $passwordHash ?? $this->currentUser->passwordHash,
            $name,
            $lastname,
        );

        return new AuthUser($id, $this->currentUser->email, null, $name, $lastname);
    }

    public function deleteByEmail(string $email): bool
    {
        return null !== $this->currentUser && strtolower($email) === $this->currentUser->email;
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

final class SpyAuthSessionManagerForAuthController implements AuthSessionManager
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

final class StubAccessTokenManager implements AccessTokenManager
{
    public function issueToken(AuthUser $user): IssuedAccessToken
    {
        return new IssuedAccessToken('issued-token', new \DateTimeImmutable('2030-01-01T00:00:00+00:00'));
    }

    public function parseToken(string $token): ?AccessTokenClaims
    {
        return null;
    }
}
