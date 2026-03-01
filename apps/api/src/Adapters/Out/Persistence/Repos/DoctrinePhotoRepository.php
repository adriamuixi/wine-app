<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Repos;

use App\Domain\Enum\WinePhotoType;
use App\Domain\Model\WinePhoto;
use Doctrine\ORM\EntityManagerInterface;

final readonly class DoctrinePhotoRepository
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
    }

    public function createForWine(
        int $wineId,
        WinePhotoType $type,
        string $url,
        string $hash,
        int $size,
        string $extension,
    ): int {
        $id = $this->entityManager->getConnection()->fetchOne(
            <<<'SQL'
INSERT INTO wine_photo (wine_id, url, type, hash, size, extension)
VALUES (:wine_id, :url, :type, :hash, :size, :extension)
RETURNING id
SQL,
            [
                'wine_id' => $wineId,
                'url' => $url,
                'type' => $type->value,
                'hash' => $hash,
                'size' => $size,
                'extension' => $extension,
            ],
        );

        return (int) $id;
    }

    public function findByWineAndType(int $wineId, WinePhotoType $type): ?WinePhoto
    {
        $row = $this->entityManager->getConnection()->fetchAssociative(
            'SELECT id, url, type FROM wine_photo WHERE wine_id = :wine_id AND type = :type LIMIT 1',
            [
                'wine_id' => $wineId,
                'type' => $type->value,
            ],
        );

        if (!is_array($row)) {
            return null;
        }

        return new WinePhoto(
            (int) $row['id'],
            (string) $row['url'],
            WinePhotoType::from((string) $row['type']),
        );
    }

    public function updateById(
        int $id,
        string $url,
        string $hash,
        int $size,
        string $extension,
    ): void {
        $this->entityManager->getConnection()->executeStatement(
            'UPDATE wine_photo SET url = :url, hash = :hash, size = :size, extension = :extension WHERE id = :id',
            [
                'id' => $id,
                'url' => $url,
                'hash' => $hash,
                'size' => $size,
                'extension' => $extension,
            ],
        );
    }

    public function findUrlsByWineId(int $wineId): array
    {
        $urls = $this->entityManager->getConnection()->fetchFirstColumn(
            'SELECT url FROM wine_photo WHERE wine_id = :wine_id',
            ['wine_id' => $wineId],
        );

        return array_values(array_map(static fn (mixed $url): string => (string) $url, $urls));
    }
}
