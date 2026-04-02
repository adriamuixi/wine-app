<?php

declare(strict_types=1);

namespace App\Adapters\Out\Security;

use App\Application\Ports\AccessTokenClaims;
use App\Application\Ports\AccessTokenManager;
use App\Application\Ports\IssuedAccessToken;
use App\Domain\Model\AuthUser;

final readonly class JwtAccessTokenManager implements AccessTokenManager
{
    public function __construct(
        private string $secret,
        private int $ttlSeconds,
    ) {
    }

    public function issueToken(AuthUser $user): IssuedAccessToken
    {
        $issuedAt = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));
        $expiresAt = $issuedAt->modify(sprintf('+%d seconds', $this->ttlSeconds));

        $header = $this->base64UrlEncode((string) json_encode([
            'alg' => 'HS256',
            'typ' => 'JWT',
        ], JSON_THROW_ON_ERROR));

        $payload = $this->base64UrlEncode((string) json_encode([
            'sub' => (string) $user->id,
            'email' => $user->email,
            'iat' => $issuedAt->getTimestamp(),
            'exp' => $expiresAt->getTimestamp(),
        ], JSON_THROW_ON_ERROR));

        $signature = $this->sign($header.'.'.$payload);

        return new IssuedAccessToken(
            token: $header.'.'.$payload.'.'.$signature,
            expiresAt: $expiresAt,
        );
    }

    public function parseToken(string $token): ?AccessTokenClaims
    {
        $parts = explode('.', $token);
        if (3 !== count($parts)) {
            return null;
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;

        if (!hash_equals($this->sign($encodedHeader.'.'.$encodedPayload), $encodedSignature)) {
            return null;
        }

        $header = $this->decodeJsonPart($encodedHeader);
        $payload = $this->decodeJsonPart($encodedPayload);

        if (!is_array($header) || !is_array($payload)) {
            return null;
        }

        if (($header['alg'] ?? null) !== 'HS256') {
            return null;
        }

        $userId = $payload['sub'] ?? null;
        $email = $payload['email'] ?? null;
        $exp = $payload['exp'] ?? null;

        if (!is_string($userId) || !ctype_digit($userId) || !is_string($email) || !is_int($exp)) {
            return null;
        }

        if ($exp < time()) {
            return null;
        }

        return new AccessTokenClaims(
            userId: (int) $userId,
            email: $email,
            expiresAt: (new \DateTimeImmutable('@'.$exp))->setTimezone(new \DateTimeZone('UTC')),
        );
    }

    private function sign(string $message): string
    {
        return $this->base64UrlEncode(hash_hmac('sha256', $message, $this->secret, true));
    }

    /**
     * @return array<string, mixed>|null
     */
    private function decodeJsonPart(string $encodedPart): ?array
    {
        $decoded = $this->base64UrlDecode($encodedPart);
        if (false === $decoded) {
            return null;
        }

        try {
            $payload = json_decode($decoded, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return null;
        }

        return is_array($payload) ? $payload : null;
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $value): string|false
    {
        $padding = strlen($value) % 4;
        if (0 !== $padding) {
            $value .= str_repeat('=', 4 - $padding);
        }

        return base64_decode(strtr($value, '-_', '+/'), true);
    }
}
