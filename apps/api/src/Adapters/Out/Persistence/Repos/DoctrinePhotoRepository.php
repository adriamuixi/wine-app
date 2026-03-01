<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Repos;

use App\Domain\Enum\WinePhotoType;
use App\Domain\Model\WinePhoto;
use App\Domain\Repository\WinePhotoRepository;
use Doctrine\ORM\EntityManagerInterface;

final readonly class DoctrinePhotoRepository implements WinePhotoRepository
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
    }

    public function create(int $wineId, WinePhoto $photo): int
    {
        $id = $this->entityManager->getConnection()->fetchOne(
            <<<'SQL'
INSERT INTO wine_photo (wine_id, url, type, hash, size, extension)
VALUES (:wine_id, :url, :type, :hash, :size, :extension)
RETURNING id
SQL,
            [
                'wine_id' => $wineId,
                'url' => $photo->url,
                'type' => $photo->type->value,
                'hash' => $photo->hash,
                'size' => $photo->size,
                'extension' => $photo->extension,
            ],
        );

        return (int) $id;
    }

    public function findByWineAndType(int $wineId, WinePhotoType $type): ?WinePhoto
    {
        $row = $this->entityManager->getConnection()->fetchAssociative(
            'SELECT id, url, type, hash, size, extension FROM wine_photo WHERE wine_id = :wine_id AND type = :type LIMIT 1',
            [
                'wine_id' => $wineId,
                'type' => $type->value,
            ],
        );

        if (!is_array($row)) {
            return null;
        }

        return new WinePhoto(
            id: (int) $row['id'],
            url: (string) $row['url'],
            type: WinePhotoType::from((string) $row['type']),
            hash: null === $row['hash'] ? null : (string) $row['hash'],
            size: null === $row['size'] ? null : (int) $row['size'],
            extension: null === $row['extension'] ? null : (string) $row['extension'],
        );
    }

    public function findByWineId(int $wineId): array
    {
        $rows = $this->entityManager->getConnection()->fetchAllAssociative(
            'SELECT id, url, type, hash, size, extension FROM wine_photo WHERE wine_id = :wine_id ORDER BY id ASC',
            ['wine_id' => $wineId],
        );

        return array_map(
            static fn (array $row): WinePhoto => new WinePhoto(
                id: (int) $row['id'],
                url: (string) $row['url'],
                type: WinePhotoType::from((string) $row['type']),
                hash: null === $row['hash'] ? null : (string) $row['hash'],
                size: null === $row['size'] ? null : (int) $row['size'],
                extension: null === $row['extension'] ? null : (string) $row['extension'],
            ),
            $rows,
        );
    }

    public function update(WinePhoto $photo): void
    {
        if (null === $photo->id) {
            throw new \InvalidArgumentException('photo id is required for update.');
        }

        $this->entityManager->getConnection()->executeStatement(
            'UPDATE wine_photo SET url = :url, hash = :hash, size = :size, extension = :extension WHERE id = :id',
            [
                'id' => $photo->id,
                'url' => $photo->url,
                'hash' => $photo->hash,
                'size' => $photo->size,
                'extension' => $photo->extension,
            ],
        );
    }

}
