<?php

declare(strict_types=1);

namespace App\Application\Ports;

use App\Application\UseCases\Auth\AuthUserCredentials;
use App\Application\UseCases\Auth\AuthUserView;

interface UserRepository
{
    public function findAuthByEmail(string $email): ?AuthUserCredentials;

    public function findAuthUserById(int $id): ?AuthUserView;
}
