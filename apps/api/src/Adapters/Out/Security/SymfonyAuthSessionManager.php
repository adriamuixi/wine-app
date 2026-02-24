<?php

declare(strict_types=1);

namespace App\Adapters\Out\Security;

use App\Adapters\Out\Persistence\Doctrine\Entity\UserRecord;
use App\Application\Ports\AuthSessionManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Exception\LogicException;

final readonly class SymfonyAuthSessionManager implements AuthSessionManager
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private Security $security,
    ) {
    }

    public function loginByUserId(int $userId): void
    {
        /** @var UserRecord|null $user */
        $user = $this->entityManager->getRepository(UserRecord::class)->find($userId);
        if (null === $user) {
            throw new \RuntimeException('User not found for session login.');
        }

        $this->security->login($user, 'json_login', 'main');
    }

    public function getAuthenticatedUserId(): ?int
    {
        $user = $this->security->getUser();
        if (!$user instanceof UserRecord) {
            return null;
        }

        return $user->getId();
    }

    public function logout(): void
    {
        try {
            $this->security->logout(false);
        } catch (LogicException) {
            // Idempotent API logout when no authenticated session exists.
        }
    }
}
