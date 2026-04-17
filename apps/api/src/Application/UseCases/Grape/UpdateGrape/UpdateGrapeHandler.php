<?php

declare(strict_types=1);

namespace App\Application\UseCases\Grape\UpdateGrape;

use App\Domain\Model\Grape;
use App\Domain\Repository\GrapeRepository;

final readonly class UpdateGrapeHandler
{
    public function __construct(private GrapeRepository $grapes)
    {
    }

    public function handle(UpdateGrapeCommand $command): void
    {
        try {
            $this->validatePatchRequest($command);
        } catch (\InvalidArgumentException $exception) {
            throw new UpdateGrapeValidationException($exception->getMessage(), previous: $exception);
        }

        $existing = $this->grapes->findById($command->grapeId);
        if (null === $existing) {
            throw new UpdateGrapeNotFound(sprintf('Grape not found for id %d.', $command->grapeId));
        }

        try {
            $updated = new Grape(
                id: $existing->id,
                name: $command->isProvided('name') ? (string) $command->name : $existing->name,
                color: $command->isProvided('color') ? $command->color : $existing->color,
            );
        } catch (\InvalidArgumentException $exception) {
            throw new UpdateGrapeValidationException($exception->getMessage(), previous: $exception);
        }

        if (!$this->grapes->update($updated)) {
            throw new UpdateGrapeNotFound(sprintf('Grape not found for id %d.', $command->grapeId));
        }
    }

    private function validatePatchRequest(UpdateGrapeCommand $command): void
    {
        if ([] === array_filter($command->provided)) {
            throw new \InvalidArgumentException('At least one field is required to update.');
        }

        if ($command->isProvided('name') && (null === $command->name || '' === trim($command->name))) {
            throw new \InvalidArgumentException('name cannot be empty.');
        }

        if ($command->isProvided('color') && null === $command->color) {
            throw new \InvalidArgumentException('color cannot be null.');
        }
    }
}

