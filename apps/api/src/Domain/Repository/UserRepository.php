<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Model\AuthUser;

interface UserRepository
{
    public function findAuthByEmail(string $email): ?AuthUser;

    public function findAuthUserById(int $id): ?AuthUser;
}
