<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Repos;

use App\Application\UseCases\DesignationOfOrigin\ListDesignationsOfOrigin\ListDesignationsOfOriginSort;
use App\Domain\Repository\DesignationOfOriginRepository;
use App\Domain\Enum\Country;
use App\Domain\Model\DesignationOfOrigin;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\ORM\EntityManagerInterface;

final readonly class DoctrineDesignationOfOriginRepository implements DesignationOfOriginRepository
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
    }

    public function findCountryById(int $id): ?Country
    {
        $do = $this->findById($id);
        if (null === $do) {
            return null;
        }

        return $do->country;
    }

    public function create(DesignationOfOrigin $do): int
    {
        $id = $this->entityManager->getConnection()->fetchOne(
            'INSERT INTO designation_of_origin (name, region, country, country_code, do_logo, region_logo, map_data)
             VALUES (:name, :region, :country, :country_code, :do_logo, :region_logo, CAST(:map_data AS JSONB))
             RETURNING id',
            [
                'name' => $do->name,
                'region' => $do->region,
                'country' => $do->country->value,
                'country_code' => $do->countryCode,
                'do_logo' => $do->doLogo,
                'region_logo' => $do->regionLogo,
                'map_data' => $this->encodeMapData($do->mapData),
            ],
        );

        return (int) $id;
    }

    public function findById(int $id): ?DesignationOfOrigin
    {
        $row = $this->entityManager->getConnection()->fetchAssociative(
            'SELECT id, name, region, country, country_code, do_logo, region_logo, map_data FROM designation_of_origin WHERE id = :id',
            ['id' => $id],
        );

        if (!is_array($row)) {
            return null;
        }

        return new DesignationOfOrigin(
            id: (int) $row['id'],
            name: (string) $row['name'],
            region: (string) $row['region'],
            country: Country::from((string) $row['country']),
            countryCode: (string) $row['country_code'],
            doLogo: null === $row['do_logo'] ? null : (string) $row['do_logo'],
            regionLogo: null === $row['region_logo'] ? null : (string) $row['region_logo'],
            mapData: $this->decodeMapData($row['map_data'] ?? null),
        );
    }

    public function findAll(
        array $sortFields = [],
        ?string $name = null,
        ?Country $country = null,
        ?string $region = null,
        array $userIds = [],
        ?bool $hasWines = null,
    ): array
    {
        $resolvedSortFields = [] === $sortFields ? ListDesignationsOfOriginSort::DEFAULT_ORDER : $sortFields;
        $columnMap = [
            ListDesignationsOfOriginSort::COUNTRY => 'd.country',
            ListDesignationsOfOriginSort::REGION => 'd.region',
            ListDesignationsOfOriginSort::NAME => 'd.name',
        ];
        $orderBy = implode(', ', array_map(
            static fn (string $field): string => sprintf('%s ASC', $columnMap[$field] ?? 'd.name'),
            $resolvedSortFields,
        ));

        $where = [];
        $params = [];
        $types = [];
        if (null !== $name && '' !== trim($name)) {
            $where[] = 'd.name ILIKE :name';
            $params['name'] = '%'.trim($name).'%';
        }
        if (null !== $country) {
            $where[] = 'd.country = :country';
            $params['country'] = $country->value;
        }
        if (null !== $region && '' !== trim($region)) {
            $where[] = 'd.region ILIKE :region';
            $params['region'] = '%'.trim($region).'%';
        }
        if ([] !== $userIds) {
            $where[] = <<<'SQL'
EXISTS (
    SELECT 1
    FROM wine w
    INNER JOIN review r ON r.wine_id = w.id
    WHERE w.do_id = d.id
      AND r.user_id IN (:user_ids)
    GROUP BY w.id
    HAVING COUNT(DISTINCT r.user_id) = :required_user_count
)
SQL;
            $params['user_ids'] = $userIds;
            $params['required_user_count'] = count($userIds);
            $types['user_ids'] = ArrayParameterType::INTEGER;
        }
        if (true === $hasWines) {
            $where[] = 'EXISTS (SELECT 1 FROM wine w WHERE w.do_id = d.id)';
        } elseif (false === $hasWines) {
            $where[] = 'NOT EXISTS (SELECT 1 FROM wine w WHERE w.do_id = d.id)';
        }

        $sql = 'SELECT d.id, d.name, d.region, d.country, d.country_code, d.do_logo, d.region_logo, d.map_data FROM designation_of_origin d';
        if ([] !== $where) {
            $sql .= ' WHERE '.implode(' AND ', $where);
        }
        $sql .= sprintf(' ORDER BY %s', $orderBy);

        $rows = $this->entityManager->getConnection()->fetchAllAssociative(
            $sql,
            $params,
            $types,
        );

        return array_map(
            fn (array $row): DesignationOfOrigin => new DesignationOfOrigin(
                id: (int) $row['id'],
                name: (string) $row['name'],
                region: (string) $row['region'],
                country: Country::from((string) $row['country']),
                countryCode: (string) $row['country_code'],
                doLogo: null === $row['do_logo'] ? null : (string) $row['do_logo'],
                regionLogo: null === $row['region_logo'] ? null : (string) $row['region_logo'],
                mapData: $this->decodeMapData($row['map_data'] ?? null),
            ),
            $rows,
        );
    }

    public function update(DesignationOfOrigin $do): bool
    {
        return $this->entityManager->getConnection()->executeStatement(
            'UPDATE designation_of_origin SET name = :name, region = :region, country = :country, country_code = :country_code, do_logo = :do_logo, region_logo = :region_logo, map_data = CAST(:map_data AS JSONB) WHERE id = :id',
            [
                'id' => $do->id,
                'name' => $do->name,
                'region' => $do->region,
                'country' => $do->country->value,
                'country_code' => $do->countryCode,
                'do_logo' => $do->doLogo,
                'region_logo' => $do->regionLogo,
                'map_data' => $this->encodeMapData($do->mapData),
            ],
        ) > 0;
    }

    public function deleteById(int $id): bool
    {
        return $this->entityManager->getConnection()->executeStatement(
            'DELETE FROM designation_of_origin WHERE id = :id',
            ['id' => $id],
        ) > 0;
    }

    public function hasAssociatedWines(int $id): bool
    {
        $result = $this->entityManager->getConnection()->fetchOne(
            'SELECT 1 FROM wine WHERE do_id = :id LIMIT 1',
            ['id' => $id],
        );

        return false !== $result;
    }

    private function encodeMapData(?array $mapData): ?string
    {
        if (null === $mapData) {
            return null;
        }

        return json_encode($mapData, JSON_THROW_ON_ERROR);
    }

    private function decodeMapData(mixed $value): ?array
    {
        if (null === $value) {
            return null;
        }

        if (is_string($value)) {
            /** @var mixed $decoded */
            $decoded = json_decode($value, true, 512, JSON_THROW_ON_ERROR);
        } else {
            $decoded = $value;
        }

        if (!is_array($decoded)) {
            return null;
        }

        if (!array_key_exists('lat', $decoded) || !array_key_exists('lng', $decoded)) {
            return null;
        }

        return [
            'lat' => (float) $decoded['lat'],
            'lng' => (float) $decoded['lng'],
            'zoom' => isset($decoded['zoom']) ? (int) $decoded['zoom'] : null,
        ];
    }
}
