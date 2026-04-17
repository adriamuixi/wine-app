<?php

declare(strict_types=1);

namespace App\Application\UseCases\Grape\CreateGrape;

use App\Domain\Model\Grape;
use App\Domain\Repository\GrapeRepository;

final readonly class CreateGrapeHandler
{
    public function __construct(private GrapeRepository $grapes)
    {
    }

    public function handle(CreateGrapeCommand $command): CreateGrapeResult
    {
        try {
            if ('' === trim($command->name)) {
                throw new \InvalidArgumentException('name is required.');
            }

            $grape = new Grape(
                id: 1,
                name: $command->name,
                color: $command->color,
            );
        } catch (\InvalidArgumentException $exception) {
            throw new CreateGrapeValidationException($exception->getMessage(), previous: $exception);
        }

        $id = $this->grapes->create($grape);

        return new CreateGrapeResult($id);
    }
}

