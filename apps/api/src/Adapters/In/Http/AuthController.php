<?php

declare(strict_types=1);

namespace App\Adapters\In\Http;

use App\Application\UseCases\Auth\Login\InvalidCredentials;
use App\Application\UseCases\Auth\Login\LoginCommand;
use App\Application\UseCases\Auth\Login\LoginHandler;
use App\Application\UseCases\Auth\Logout\LogoutHandler;
use App\Application\UseCases\Auth\User\CreateUser\CreateUserAlreadyExists;
use App\Application\UseCases\Auth\User\CreateUser\CreateUserCommand;
use App\Application\UseCases\Auth\User\CreateUser\CreateUserHandler;
use App\Application\UseCases\Auth\User\CreateUser\CreateUserValidationException;
use App\Application\UseCases\Auth\User\DeleteUser\DeleteUserByEmailCommand;
use App\Application\UseCases\Auth\User\DeleteUser\DeleteUserByEmailHandler;
use App\Application\UseCases\Auth\User\DeleteUser\DeleteUserNotFound;
use App\Application\UseCases\Auth\User\DeleteUser\DeleteUserValidationException;
use App\Application\UseCases\Auth\User\GetCurrentUserHandler;
use App\Domain\Model\AuthUser;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class AuthController
{
    public function __construct(
        private readonly LoginHandler $loginHandler,
        private readonly GetCurrentUserHandler $getCurrentUserHandler,
        private readonly LogoutHandler $logoutHandler,
        private readonly CreateUserHandler $createUserHandler,
        private readonly DeleteUserByEmailHandler $deleteUserByEmailHandler,
    ) {
    }

    #[Route('/api/auth/login', name: 'api_auth_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);
        if (!is_array($payload)) {
            return new JsonResponse(['error' => 'Invalid JSON body.'], Response::HTTP_BAD_REQUEST);
        }

        $email = $payload['email'] ?? null;
        $password = $payload['password'] ?? null;

        if (!is_string($email) || '' === trim($email) || !is_string($password) || '' === $password) {
            return new JsonResponse(['error' => 'email and password are required.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $user = $this->loginHandler->handle(new LoginCommand($email, $password));
        } catch (InvalidCredentials) {
            return new JsonResponse(['error' => 'Invalid credentials.'], Response::HTTP_UNAUTHORIZED);
        }

        return new JsonResponse(['user' => $this->userPayload($user)], Response::HTTP_OK);
    }

    #[Route('/api/auth/me', name: 'api_auth_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getCurrentUserHandler->handle();
        if (null === $user) {
            return new JsonResponse(['error' => 'Unauthenticated.'], Response::HTTP_UNAUTHORIZED);
        }

        return new JsonResponse(['user' => $this->userPayload($user)], Response::HTTP_OK);
    }

    #[Route('/api/auth/logout', name: 'api_auth_logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        $this->logoutHandler->handle();

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/api/auth/users', name: 'api_auth_users_create', methods: ['POST'])]
    public function createUser(Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);
        if (!is_array($payload)) {
            return new JsonResponse(['error' => 'Invalid JSON body.'], Response::HTTP_BAD_REQUEST);
        }

        $email = $payload['email'] ?? null;
        $name = $payload['name'] ?? null;
        $lastname = $payload['lastname'] ?? null;
        $password = $payload['password'] ?? null;
        if (!is_string($email) || !is_string($name) || !is_string($lastname) || !is_string($password)) {
            return new JsonResponse(['error' => 'email, name, lastname and password are required.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $user = $this->createUserHandler->handle(new CreateUserCommand($email, $name, $lastname, $password));
        } catch (CreateUserValidationException $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (CreateUserAlreadyExists $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_CONFLICT);
        }

        return new JsonResponse(['user' => $this->userPayload($user)], Response::HTTP_CREATED);
    }

    #[Route('/api/auth/users', name: 'api_auth_users_delete', methods: ['DELETE'])]
    public function deleteUser(Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);
        if (!is_array($payload)) {
            return new JsonResponse(['error' => 'Invalid JSON body.'], Response::HTTP_BAD_REQUEST);
        }

        $email = $payload['email'] ?? null;
        if (!is_string($email)) {
            return new JsonResponse(['error' => 'email is required.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $this->deleteUserByEmailHandler->handle(new DeleteUserByEmailCommand($email));
        } catch (DeleteUserValidationException $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (DeleteUserNotFound $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * @return array{id:int,email:string,name:string,lastname:string}
     */
    private function userPayload(AuthUser $user): array
    {
        return [
            'id' => $user->id,
            'email' => $user->email,
            'name' => $user->name,
            'lastname' => $user->lastname,
        ];
    }
}
