<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Repos;

use App\Domain\Enum\GrapeColor;
use App\Domain\Model\Grape;
use App\Domain\Repository\GrapeRepository;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\ParameterType;
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

    public function create(Grape $grape): int
    {
        $this->entityManager->getConnection()->executeStatement(
            'INSERT INTO grape (name, color) VALUES (:name, :color)',
            [
                'name' => $grape->name,
                'color' => $grape->color->value,
            ],
            [
                'name' => ParameterType::STRING,
                'color' => ParameterType::STRING,
            ],
        );

        return (int) $this->entityManager->getConnection()->lastInsertId();
    }

    public function findById(int $id): ?Grape
    {
        $row = $this->entityManager->getConnection()->fetchAssociative(
            'SELECT id, name, color FROM grape WHERE id = :id',
            ['id' => $id],
            ['id' => ParameterType::INTEGER],
        );

        if (false === $row) {
            return null;
        }

        return $this->mapRowToGrape($row);
    }

    public function findAll(array $sortFields = [], ?string $name = null, ?GrapeColor $color = null): array
    {
        $order = [];
        foreach ($sortFields as $field) {
            if ('color' === $field) {
                $order[] = "CASE g.color WHEN 'red' THEN 0 WHEN 'white' THEN 1 ELSE 2 END";
                continue;
            }
            if ('name' === $field) {
                $order[] = 'g.name';
            }
        }
        if ([] === $order) {
            $order = ["CASE g.color WHEN 'red' THEN 0 WHEN 'white' THEN 1 ELSE 2 END", 'g.name'];
        }

        $whereParts = [];
        $params = [];
        $types = [];

        if (null !== $name && '' !== trim($name)) {
            $whereParts[] = 'LOWER(g.name) LIKE LOWER(:name)';
            $params['name'] = '%'.trim($name).'%';
            $types['name'] = ParameterType::STRING;
        }

        if (null !== $color) {
            $whereParts[] = 'g.color = :color';
            $params['color'] = $color->value;
            $types['color'] = ParameterType::STRING;
        }

        $sql = <<<'SQL'
SELECT
  g.id,
  g.name,
  g.color
FROM grape g
SQL;
        if ([] !== $whereParts) {
            $sql .= ' WHERE '.implode(' AND ', $whereParts);
        }
        $sql .= ' ORDER BY '.implode(', ', array_map(static fn (string $item): string => $item.' ASC', $order));

        $rows = $this->entityManager->getConnection()->fetchAllAssociative(
            $sql,
            $params,
            $types,
        );

        return array_map(
            fn (array $row): Grape => $this->mapRowToGrape($row),
            $rows,
        );
    }

    public function update(Grape $grape): bool
    {
        $affected = $this->entityManager->getConnection()->executeStatement(
            'UPDATE grape SET name = :name, color = :color WHERE id = :id',
            [
                'id' => $grape->id,
                'name' => $grape->name,
                'color' => $grape->color->value,
            ],
            [
                'id' => ParameterType::INTEGER,
                'name' => ParameterType::STRING,
                'color' => ParameterType::STRING,
            ],
        );

        return $affected > 0;
    }

    public function deleteById(int $id): bool
    {
        $affected = $this->entityManager->getConnection()->executeStatement(
            'DELETE FROM grape WHERE id = :id',
            ['id' => $id],
            ['id' => ParameterType::INTEGER],
        );

        return $affected > 0;
    }

    public function hasAssociatedWines(int $id): bool
    {
        $count = (int) $this->entityManager->getConnection()->fetchOne(
            'SELECT COUNT(*) FROM wine_grape WHERE grape_id = :id',
            ['id' => $id],
            ['id' => ParameterType::INTEGER],
        );

        return $count > 0;
    }

    /**
     * @param array<string,mixed> $row
     */
    private function mapRowToGrape(array $row): Grape
    {
        return new Grape(
            id: (int) $row['id'],
            name: (string) $row['name'],
            color: GrapeColor::from((string) $row['color']),
        );
    }
}
