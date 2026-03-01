<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Repos;

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
            'SELECT id, name, region, country, country_code FROM "do" WHERE id = :id',
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
        );
    }
}
