<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Repos;

use App\Domain\Enum\GrapeColor;
use App\Domain\Model\Grape;
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

    public function findAll(): array
    {
        $rows = $this->entityManager->getConnection()->fetchAllAssociative(
            <<<'SQL'
SELECT
  g.id,
  g.name,
  g.color
FROM grape g
ORDER BY
  CASE g.color
    WHEN 'red' THEN 0
    WHEN 'white' THEN 1
    ELSE 2
  END,
  g.name ASC
SQL,
        );

        return array_map(
            static function (array $row): Grape {
                return new Grape(
                    id: (int) $row['id'],
                    name: (string) $row['name'],
                    color: GrapeColor::from((string) $row['color']),
                );
            },
            $rows,
        );
    }
}
