<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Repos;

use App\Application\UseCases\Do\ListDos\ListDosSort;
use App\Domain\Repository\DoRepository;
use App\Domain\Enum\Country;
use App\Domain\Model\DenominationOfOrigin;
use Doctrine\ORM\EntityManagerInterface;

final readonly class DoctrineDoRepository implements DoRepository
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

    public function findById(int $id): ?DenominationOfOrigin
    {
        $row = $this->entityManager->getConnection()->fetchAssociative(
            'SELECT id, name, region, country, country_code, do_logo, region_logo FROM "do" WHERE id = :id',
            ['id' => $id],
        );

        if (!is_array($row)) {
            return null;
        }

        return new DenominationOfOrigin(
            id: (int) $row['id'],
            name: (string) $row['name'],
            region: (string) $row['region'],
            country: Country::from((string) $row['country']),
            countryCode: (string) $row['country_code'],
            doLogo: null === $row['do_logo'] ? null : (string) $row['do_logo'],
            regionLogo: null === $row['region_logo'] ? null : (string) $row['region_logo'],
        );
    }

    public function findAll(array $sortFields = []): array
    {
        $resolvedSortFields = [] === $sortFields ? ListDosSort::DEFAULT_ORDER : $sortFields;
        $columnMap = [
            ListDosSort::COUNTRY => 'country',
            ListDosSort::REGION => 'region',
            ListDosSort::NAME => 'name',
        ];
        $orderBy = implode(', ', array_map(
            static fn (string $field): string => sprintf('%s ASC', $columnMap[$field] ?? 'name'),
            $resolvedSortFields,
        ));

        $rows = $this->entityManager->getConnection()->fetchAllAssociative(
            sprintf('SELECT id, name, region, country, country_code, do_logo, region_logo FROM "do" ORDER BY %s', $orderBy),
        );

        return array_map(
            static fn (array $row): DenominationOfOrigin => new DenominationOfOrigin(
                id: (int) $row['id'],
                name: (string) $row['name'],
                region: (string) $row['region'],
                country: Country::from((string) $row['country']),
                countryCode: (string) $row['country_code'],
                doLogo: null === $row['do_logo'] ? null : (string) $row['do_logo'],
                regionLogo: null === $row['region_logo'] ? null : (string) $row['region_logo'],
            ),
            $rows,
        );
    }
}
