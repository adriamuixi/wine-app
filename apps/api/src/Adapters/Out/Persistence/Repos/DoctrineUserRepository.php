<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Repos;

use App\Adapters\Out\Persistence\Doctrine\Entity\UserRecord;
use App\Domain\Model\AuthUser;
use App\Domain\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;

final readonly class DoctrineUserRepository implements UserRepository
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
    }

    public function findAuthByEmail(string $email): ?AuthUser
    {
        /** @var UserRecord|null $user */
        $user = $this->entityManager->getRepository(UserRecord::class)->findOneBy(['email' => $email]);
        if (null === $user || null === $user->getId()) {
            return null;
        }

        return new AuthUser(
            $user->getId(),
            $user->getEmail(),
            $user->getPasswordHash(),
            $user->getName(),
            $user->getLastname(),
        );
    }

    public function findAuthUserById(int $id): ?AuthUser
    {
        /** @var UserRecord|null $user */
        $user = $this->entityManager->getRepository(UserRecord::class)->find($id);
        if (null === $user || null === $user->getId()) {
            return null;
        }

        return new AuthUser(
            $user->getId(),
            $user->getEmail(),
            null,
            $user->getName(),
            $user->getLastname(),
        );
    }
}
