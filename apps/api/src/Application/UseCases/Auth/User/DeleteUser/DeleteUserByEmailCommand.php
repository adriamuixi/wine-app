<?php

declare(strict_types=1);

namespace App\Application\UseCases\Auth\User\DeleteUser;

final readonly class DeleteUserByEmailCommand
{
    public function __construct(public string $email)
    {
    }
}

