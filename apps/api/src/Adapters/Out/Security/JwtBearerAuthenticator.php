<?php

declare(strict_types=1);

namespace App\Adapters\Out\Security;

use App\Application\Ports\AccessTokenManager;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

final class JwtBearerAuthenticator extends AbstractAuthenticator
{
    public function __construct(private readonly AccessTokenManager $accessTokens)
    {
    }

    public function supports(Request $request): ?bool
    {
        $authorization = $request->headers->get('Authorization');

        return is_string($authorization) && str_starts_with($authorization, 'Bearer ');
    }

    public function authenticate(Request $request): Passport
    {
        $authorization = $request->headers->get('Authorization');
        if (!is_string($authorization)) {
            throw new CustomUserMessageAuthenticationException('Invalid or expired access token.');
        }

        $token = trim(substr($authorization, 7));
        if ('' === $token) {
            throw new CustomUserMessageAuthenticationException('Invalid or expired access token.');
        }

        $claims = $this->accessTokens->parseToken($token);
        if (null === $claims) {
            throw new CustomUserMessageAuthenticationException('Invalid or expired access token.');
        }

        return new SelfValidatingPassport(new UserBadge($claims->email));
    }

    public function onAuthenticationSuccess(Request $request, $token, string $firewallName): ?Response
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse(['error' => $exception->getMessageKey()], Response::HTTP_UNAUTHORIZED);
    }

    public function start(Request $request, ?AuthenticationException $authException = null): Response
    {
        return new JsonResponse(['error' => 'Unauthenticated.'], Response::HTTP_UNAUTHORIZED);
    }
}
