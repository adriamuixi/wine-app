<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Repos;

use App\Domain\Repository\GrapeRepository;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\ORM\EntityManagerInterface;

final readonly class DoctrineGrapeRepository implements GrapeRepository
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
    }

    public function findExistingIds(array $ids): array
    {
        if ([] === $ids) {
            return [];
        }

        $existing = $this->entityManager->getConnection()->fetchFirstColumn(
            'SELECT id FROM grape WHERE id IN (:ids)',
            ['ids' => $ids],
            ['ids' => ArrayParameterType::INTEGER],
        );

        return array_map('intval', $existing);
    }
}
