<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Model\AuthUser;

interface UserRepository
{
    public function findByEmail(string $email): ?AuthUser;

    public function findById(int $id): ?AuthUser;

    public function create(string $email, string $name, string $lastname, string $passwordHash): AuthUser;

    public function deleteByEmail(string $email): bool;
}
