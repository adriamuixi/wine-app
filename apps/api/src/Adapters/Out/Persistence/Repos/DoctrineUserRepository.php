<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Repos;

use App\Adapters\Out\Persistence\Doctrine\Entity\UserRecord;
use App\Application\Ports\UserRepository;
use App\Application\UseCases\Auth\AuthUserCredentials;
use App\Application\UseCases\Auth\AuthUserView;
use Doctrine\ORM\EntityManagerInterface;

final readonly class DoctrineUserRepository implements UserRepository
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
    }

    public function findAuthByEmail(string $email): ?AuthUserCredentials
    {
        /** @var UserRecord|null $user */
        $user = $this->entityManager->getRepository(UserRecord::class)->findOneBy(['email' => $email]);
        if (null === $user || null === $user->getId()) {
            return null;
        }

        return new AuthUserCredentials(
            $user->getId(),
            $user->getEmail(),
            $user->getPasswordHash(),
            $user->getName(),
            $user->getLastname(),
        );
    }

    public function findAuthUserById(int $id): ?AuthUserView
    {
        /** @var UserRecord|null $user */
        $user = $this->entityManager->getRepository(UserRecord::class)->find($id);
        if (null === $user || null === $user->getId()) {
            return null;
        }

        return new AuthUserView(
            $user->getId(),
            $user->getEmail(),
            $user->getName(),
            $user->getLastname(),
        );
    }
}
