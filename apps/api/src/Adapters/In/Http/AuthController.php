<?php

declare(strict_types=1);

namespace App\Adapters\In\Http;

use App\Application\UseCases\Auth\Login\InvalidCredentials;
use App\Application\UseCases\Auth\Login\LoginCommand;
use App\Application\UseCases\Auth\Login\LoginHandler;
use App\Application\UseCases\Auth\Logout\LogoutHandler;
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
