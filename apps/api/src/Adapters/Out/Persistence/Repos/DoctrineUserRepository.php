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

    public function findByEmail(string $email): ?AuthUser
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

    public function findById(int $id): ?AuthUser
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

    public function create(string $email, string $name, string $lastname, string $passwordHash): AuthUser
    {
        $connection = $this->entityManager->getConnection();
        $id = (int) $connection->fetchOne(
            <<<'SQL'
INSERT INTO users (email, name, lastname, password_hash)
VALUES (:email, :name, :lastname, :password_hash)
RETURNING id
SQL,
            [
                'email' => $email,
                'name' => $name,
                'lastname' => $lastname,
                'password_hash' => $passwordHash,
            ],
        );

        return new AuthUser(
            $id,
            $email,
            $passwordHash,
            $name,
            $lastname,
        );
    }

    public function update(int $id, string $name, string $lastname, ?string $passwordHash): ?AuthUser
    {
        $existing = $this->entityManager->getConnection()->fetchAssociative(
            'SELECT email, password_hash FROM users WHERE id = :id LIMIT 1',
            ['id' => $id],
        );
        if (!is_array($existing)) {
            return null;
        }

        $params = [
            'id' => $id,
            'name' => $name,
            'lastname' => $lastname,
        ];

        $sql = <<<'SQL'
UPDATE users
SET name = :name,
    lastname = :lastname
SQL;

        if (null !== $passwordHash) {
            $sql .= ",\n    password_hash = :password_hash";
            $params['password_hash'] = $passwordHash;
        }

        $sql .= "\nWHERE id = :id";

        $affected = $this->entityManager->getConnection()->executeStatement($sql, $params);
        if ($affected < 1) {
            return null;
        }

        return new AuthUser(
            $id,
            (string) $existing['email'],
            null,
            $name,
            $lastname,
        );
    }

    public function deleteByEmail(string $email): bool
    {
        $affected = $this->entityManager->getConnection()->executeStatement(
            'DELETE FROM users WHERE email = :email',
            ['email' => $email],
        );

        return $affected > 0;
    }
}
