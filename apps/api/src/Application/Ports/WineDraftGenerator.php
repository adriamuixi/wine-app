<?php

declare(strict_types=1);

namespace App\Application\Ports;

use App\Application\UseCases\Wine\GenerateWineDraft\GenerateWineDraftCommand;

interface WineDraftGenerator
{
    /**
     * @return array<string,mixed>
     */
    public function generate(GenerateWineDraftCommand $command): array;
}
