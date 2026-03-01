<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Repos;

use App\Domain\Repository\WineRepository;
use App\Application\UseCases\Wine\ListWines\ListWinesQuery;
use App\Application\UseCases\Wine\ListWines\ListWinesResult;
use App\Application\UseCases\Wine\ListWines\ListWinesSort;
use App\Application\UseCases\Wine\ListWines\WineListItemView;
use App\Application\UseCases\Wine\CreateWine\CreateWineCommand;
use App\Application\UseCases\Wine\UpdateWine\UpdateWineCommand;
use App\Domain\Enum\AgingType;
use App\Domain\Enum\AwardName;
use App\Domain\Enum\Country;
use App\Domain\Enum\GrapeColor;
use App\Domain\Enum\PlaceType;
use App\Domain\Enum\ReviewBullet;
use App\Domain\Enum\WineType;
use App\Domain\Enum\WinePhotoType;
use App\Domain\Model\Award;
use App\Domain\Model\DenominationOfOrigin;
use App\Domain\Model\Place;
use App\Domain\Model\Wine;
use App\Domain\Model\WineGrape;
use App\Domain\Model\WinePhoto;
use App\Domain\Model\WinePurchase;
use App\Domain\Model\WineReview;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\ParameterType;
use Doctrine\ORM\EntityManagerInterface;

final readonly class DoctrineWineRepository implements WineRepository
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
    }

    public function create(CreateWineCommand $command, ?Country $country): int
    {
        /** @var int $wineId */
        $wineId = $this->entityManager->getConnection()->transactional(
            function (Connection $connection) use ($command, $country): int {
                $wineId = (int) $connection->fetchOne(
                    <<<'SQL'
INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
VALUES (:name, :winery, :wine_type, :do_id, :country, :aging_type, :vintage_year, :alcohol_percentage)
RETURNING id
SQL,
                    [
                        'name' => $command->name,
                        'winery' => $command->winery,
                        'wine_type' => $command->wineType?->value,
                        'do_id' => $command->doId,
                        'country' => $country?->value,
                        'aging_type' => $command->agingType?->value,
                        'vintage_year' => $command->vintageYear,
                        'alcohol_percentage' => $command->alcoholPercentage,
                    ],
                );

                foreach ($command->grapes as $grape) {
                    $connection->executeStatement(
                        'INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (:wine_id, :grape_id, :percentage)',
                        [
                            'wine_id' => $wineId,
                            'grape_id' => $grape->grapeId,
                            'percentage' => $grape->percentage,
                        ],
                    );
                }

                foreach ($command->purchases as $purchase) {
                    $placeId = (int) $connection->fetchOne(
                        <<<'SQL'
INSERT INTO place (place_type, name, address, city, country)
VALUES (:place_type, :name, :address, :city, :country)
RETURNING id
SQL,
                        [
                            'place_type' => $purchase->place->placeType->value,
                            'name' => $purchase->place->name,
                            'address' => $purchase->place->address,
                            'city' => $purchase->place->city,
                            'country' => $purchase->place->country->value,
                        ],
                    );

                    $connection->executeStatement(
                        'INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at) VALUES (:wine_id, :place_id, :price_paid, :purchased_at)',
                        [
                            'wine_id' => $wineId,
                            'place_id' => $placeId,
                            'price_paid' => $purchase->pricePaid,
                            'purchased_at' => $purchase->purchasedAt->format(\DateTimeInterface::ATOM),
                        ],
                    );
                }

                foreach ($command->awards as $award) {
                    $connection->executeStatement(
                        'INSERT INTO wine_award (wine_id, name, score, year) VALUES (:wine_id, :name, :score, :year)',
                        [
                            'wine_id' => $wineId,
                            'name' => $award->name->value,
                            'score' => $award->score,
                            'year' => $award->year,
                        ],
                    );
                }

                return $wineId;
            },
        );

        return $wineId;
    }

    public function deleteById(int $id): bool
    {
        $affected = $this->entityManager->getConnection()->executeStatement(
            'DELETE FROM wine WHERE id = :id',
            ['id' => $id],
        );

        return $affected > 0;
    }

    public function updatePartial(UpdateWineCommand $command): bool
    {
        $hasGrapes = $command->isProvided('grapes');
        $sets = [];
        $params = ['id' => $command->wineId];

        if ($command->isProvided('name')) {
            $sets[] = 'name = :name';
            $params['name'] = $command->name;
        }
        if ($command->isProvided('winery')) {
            $sets[] = 'winery = :winery';
            $params['winery'] = $command->winery;
        }
        if ($command->isProvided('wine_type')) {
            $sets[] = 'wine_type = :wine_type';
            $params['wine_type'] = $command->wineType?->value;
        }
        if ($command->isProvided('do_id')) {
            $sets[] = 'do_id = :do_id';
            $params['do_id'] = $command->doId;
        }
        if ($command->isProvided('country')) {
            $sets[] = 'country = :country';
            $params['country'] = $command->country?->value;
        }
        if ($command->isProvided('aging_type')) {
            $sets[] = 'aging_type = :aging_type';
            $params['aging_type'] = $command->agingType?->value;
        }
        if ($command->isProvided('vintage_year')) {
            $sets[] = 'vintage_year = :vintage_year';
            $params['vintage_year'] = $command->vintageYear;
        }
        if ($command->isProvided('alcohol_percentage')) {
            $sets[] = 'alcohol_percentage = :alcohol_percentage';
            $params['alcohol_percentage'] = $command->alcoholPercentage;
        }

        if ([] === $sets && !$hasGrapes) {
            return false;
        }

        $connection = $this->entityManager->getConnection();

        $affected = $connection->transactional(
            function (Connection $connection) use ($sets, $params, $command, $hasGrapes): int {
                $setsWithTimestamp = [...$sets, 'updated_at = now()'];
                $sql = sprintf('UPDATE wine SET %s WHERE id = :id', implode(', ', $setsWithTimestamp));
                $affected = $connection->executeStatement($sql, $params);
                if ($affected <= 0) {
                    return 0;
                }

                if ($hasGrapes) {
                    $connection->executeStatement(
                        'DELETE FROM wine_grape WHERE wine_id = :wine_id',
                        ['wine_id' => $command->wineId],
                    );

                    foreach ($command->grapes as $grape) {
                        $connection->executeStatement(
                            'INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (:wine_id, :grape_id, :percentage)',
                            [
                                'wine_id' => $command->wineId,
                                'grape_id' => $grape->grapeId,
                                'percentage' => $grape->percentage,
                            ],
                        );
                    }
                }

                return $affected;
            },
        );

        return $affected > 0;
    }

    public function existsById(int $id): bool
    {
        $value = $this->entityManager->getConnection()->fetchOne(
            'SELECT 1 FROM wine WHERE id = :id',
            ['id' => $id],
        );

        return false !== $value;
    }

    public function findById(int $id): ?Wine
    {
        $connection = $this->entityManager->getConnection();

        /** @var array<string,mixed>|false $wineRow */
        $wineRow = $connection->fetchAssociative(
            <<<'SQL'
SELECT
    w.id,
    w.name,
    w.winery,
    w.wine_type,
    w.country,
    w.aging_type,
    w.vintage_year,
    w.alcohol_percentage,
    w.created_at,
    w.updated_at,
    d.id AS do_id,
    d.name AS do_name,
    d.region AS do_region,
    d.country AS do_country,
    d.country_code AS do_country_code
FROM wine w
LEFT JOIN "do" d ON d.id = w.do_id
WHERE w.id = :id
SQL,
            ['id' => $id],
        );

        if (false === $wineRow) {
            return null;
        }

        $grapes = array_map(
            static fn (array $row): WineGrape => new WineGrape(
                grapeId: (int) $row['id'],
                percentage: null === $row['percentage'] ? null : (string) $row['percentage'],
                name: (string) $row['name'],
                color: GrapeColor::from((string) $row['color']),
            ),
            $connection->fetchAllAssociative(
                <<<'SQL'
SELECT g.id, g.name, g.color, wg.percentage
FROM wine_grape wg
INNER JOIN grape g ON g.id = wg.grape_id
WHERE wg.wine_id = :wine_id
ORDER BY g.name ASC
SQL,
                ['wine_id' => $id],
            ),
        );

        $purchases = array_map(
            fn (array $row): WinePurchase => new WinePurchase(
                place: new Place(
                    placeType: PlaceType::from((string) $row['place_type']),
                    name: (string) $row['place_name'],
                    address: null === $row['place_address'] ? null : (string) $row['place_address'],
                    city: null === $row['place_city'] ? null : (string) $row['place_city'],
                    country: Country::from((string) $row['place_country']),
                    id: (int) $row['place_id'],
                ),
                pricePaid: (string) $row['price_paid'],
                purchasedAt: new \DateTimeImmutable((string) $row['purchased_at']),
                id: (int) $row['id'],
            ),
            $connection->fetchAllAssociative(
                <<<'SQL'
SELECT
    wp.id,
    wp.price_paid,
    wp.purchased_at,
    p.id AS place_id,
    p.place_type,
    p.name AS place_name,
    p.address AS place_address,
    p.city AS place_city,
    p.country AS place_country
FROM wine_purchase wp
INNER JOIN place p ON p.id = wp.place_id
WHERE wp.wine_id = :wine_id
ORDER BY wp.purchased_at DESC, wp.id DESC
SQL,
                ['wine_id' => $id],
            ),
        );

        $awards = array_map(
            static fn (array $row): Award => new Award(
                name: AwardName::from((string) $row['name']),
                score: null === $row['score'] ? null : (string) $row['score'],
                year: null === $row['year'] ? null : (int) $row['year'],
                id: (int) $row['id'],
            ),
            $connection->fetchAllAssociative(
                <<<'SQL'
SELECT id, name, score, year
FROM wine_award
WHERE wine_id = :wine_id
ORDER BY year DESC NULLS LAST, id ASC
SQL,
                ['wine_id' => $id],
            ),
        );

        $photos = array_map(
            static fn (array $row): WinePhoto => new WinePhoto(
                id: (int) $row['id'],
                url: (string) $row['url'],
                type: WinePhotoType::from((string) $row['type']),
                hash: (string) $row['hash'],
                size: (int) $row['size'],
                extension: (string) $row['extension'],
            ),
            $connection->fetchAllAssociative(
                <<<'SQL'
SELECT id, type, url, hash, size, extension
FROM wine_photo
WHERE wine_id = :wine_id
ORDER BY id ASC
SQL,
                ['wine_id' => $id],
            ),
        );

        $reviewRows = $connection->fetchAllAssociative(
            <<<'SQL'
SELECT
    r.id,
    r.user_id,
    r.wine_id,
    r.score,
    r.intensity_aroma,
    r.sweetness,
    r.acidity,
    r.tannin,
    r.body,
    r.persistence,
    r.created_at,
    u.name AS user_name,
    u.lastname AS user_lastname
FROM review r
INNER JOIN users u ON u.id = r.user_id
WHERE r.wine_id = :wine_id
ORDER BY r.created_at DESC, r.id DESC
SQL,
            ['wine_id' => $id],
        );

        $reviews = $this->mapReviews($connection, $reviewRows);

        return new Wine(
            id: (int) $wineRow['id'],
            name: (string) $wineRow['name'],
            winery: null === $wineRow['winery'] ? null : (string) $wineRow['winery'],
            wineType: null === $wineRow['wine_type'] ? null : WineType::from((string) $wineRow['wine_type']),
            do: null === $wineRow['do_id'] ? null : new DenominationOfOrigin(
                id: (int) $wineRow['do_id'],
                name: (string) $wineRow['do_name'],
                region: (string) $wineRow['do_region'],
                country: Country::from((string) $wineRow['do_country']),
                countryCode: (string) $wineRow['do_country_code'],
            ),
            country: null === $wineRow['country'] ? null : Country::from((string) $wineRow['country']),
            agingType: null === $wineRow['aging_type'] ? null : AgingType::from((string) $wineRow['aging_type']),
            vintageYear: null === $wineRow['vintage_year'] ? null : (int) $wineRow['vintage_year'],
            alcoholPercentage: null === $wineRow['alcohol_percentage'] ? null : (float) $wineRow['alcohol_percentage'],
            createdAt: $this->toIso8601((string) $wineRow['created_at']),
            updatedAt: $this->toIso8601((string) $wineRow['updated_at']),
            grapes: $grapes,
            purchases: $purchases,
            awards: $awards,
            photos: $photos,
            reviews: $reviews,
        );
    }

    public function findPaginated(ListWinesQuery $query): ListWinesResult
    {
        $connection = $this->entityManager->getConnection();
        $scoreExpression = '(SELECT AVG(r.score)::numeric(5,2) FROM review r WHERE r.wine_id = w.id AND r.score IS NOT NULL)';

        $where = [];
        $params = [];
        $types = [];

        if (null !== $query->search && '' !== trim($query->search)) {
            $where[] = '(w.name ILIKE :search OR w.winery ILIKE :search OR d.name ILIKE :search OR d.region ILIKE :search)';
            $params['search'] = '%'.trim($query->search).'%';
        }

        if (null !== $query->wineType) {
            $where[] = 'w.wine_type = :wine_type';
            $params['wine_type'] = $query->wineType->value;
        }

        if (null !== $query->country) {
            $where[] = 'w.country = :country';
            $params['country'] = $query->country->value;
        }

        if (null !== $query->doId) {
            $where[] = 'w.do_id = :do_id';
            $params['do_id'] = $query->doId;
            $types['do_id'] = ParameterType::INTEGER;
        }

        if (null !== $query->grapeId) {
            $where[] = 'EXISTS (SELECT 1 FROM wine_grape wg WHERE wg.wine_id = w.id AND wg.grape_id = :grape_id)';
            $params['grape_id'] = $query->grapeId;
            $types['grape_id'] = ParameterType::INTEGER;
        }

        if (null !== $query->scoreMin) {
            $where[] = $scoreExpression.' >= :score_min';
            $params['score_min'] = $query->scoreMin;
            $types['score_min'] = ParameterType::INTEGER;
        }

        if (null !== $query->scoreMax) {
            $where[] = $scoreExpression.' <= :score_max';
            $params['score_max'] = $query->scoreMax;
            $types['score_max'] = ParameterType::INTEGER;
        }

        $whereSql = [] === $where ? '' : ' WHERE '.implode(' AND ', $where);
        $sortColumn = $this->resolveSortColumn($query->sortBy);
        $sortDirection = strtoupper($query->sortDir);
        $offset = ($query->page - 1) * $query->limit;

        $totalItems = (int) $connection->fetchOne(
            'SELECT count(*) FROM wine w LEFT JOIN "do" d ON d.id = w.do_id'.$whereSql,
            $params,
            $types,
        );

        $rows = $connection->fetchAllAssociative(
            sprintf(
                <<<'SQL'
SELECT
    w.id,
    w.name,
    w.winery,
    w.wine_type,
    w.country,
    d.id AS do_id,
    d.name AS do_name,
    w.vintage_year,
    %s AS avg_score,
    w.updated_at
FROM wine w
LEFT JOIN "do" d ON d.id = w.do_id
%s
ORDER BY %s %s NULLS LAST, w.id DESC
LIMIT :limit OFFSET :offset
SQL,
                $scoreExpression,
                $whereSql,
                $sortColumn,
                $sortDirection,
            ),
            [
                ...$params,
                'limit' => $query->limit,
                'offset' => $offset,
            ],
            [
                ...$types,
                'limit' => ParameterType::INTEGER,
                'offset' => ParameterType::INTEGER,
            ],
        );

        $items = array_map(
            fn (array $row): WineListItemView => new WineListItemView(
                id: (int) $row['id'],
                name: (string) $row['name'],
                winery: null === $row['winery'] ? null : (string) $row['winery'],
                wineType: null === $row['wine_type'] ? null : (string) $row['wine_type'],
                country: null === $row['country'] ? null : (string) $row['country'],
                doId: null === $row['do_id'] ? null : (int) $row['do_id'],
                doName: null === $row['do_name'] ? null : (string) $row['do_name'],
                vintageYear: null === $row['vintage_year'] ? null : (int) $row['vintage_year'],
                avgScore: null === $row['avg_score'] ? null : (float) $row['avg_score'],
                updatedAt: $this->toIso8601((string) $row['updated_at']),
            ),
            $rows,
        );

        $totalPages = 0 === $totalItems ? 0 : (int) ceil($totalItems / $query->limit);

        return new ListWinesResult(
            items: $items,
            page: $query->page,
            limit: $query->limit,
            totalItems: $totalItems,
            totalPages: $totalPages,
        );
    }

    /**
     * @param list<array<string,mixed>> $reviewRows
     *
     * @return list<WineReview>
     */
    private function mapReviews(Connection $connection, array $reviewRows): array
    {
        if ([] === $reviewRows) {
            return [];
        }

        $reviewIds = array_map(static fn (array $row): int => (int) $row['id'], $reviewRows);
        $bulletsRows = $connection->fetchAllAssociative(
            'SELECT review_id, bullet FROM review_bullets WHERE review_id IN (:review_ids) ORDER BY bullet ASC',
            ['review_ids' => $reviewIds],
            ['review_ids' => ArrayParameterType::INTEGER],
        );

        /** @var array<int,list<string>> $bulletsByReviewId */
        $bulletsByReviewId = [];
        foreach ($bulletsRows as $row) {
            $reviewId = (int) $row['review_id'];
            if (!array_key_exists($reviewId, $bulletsByReviewId)) {
                $bulletsByReviewId[$reviewId] = [];
            }
            $bulletsByReviewId[$reviewId][] = (string) $row['bullet'];
        }

        return array_map(
            fn (array $row): WineReview => new WineReview(
                userId: (int) $row['user_id'],
                wineId: (int) $row['wine_id'],
                intensityAroma: (int) $row['intensity_aroma'],
                sweetness: (int) $row['sweetness'],
                acidity: (int) $row['acidity'],
                tannin: null === $row['tannin'] ? null : (int) $row['tannin'],
                body: (int) $row['body'],
                persistence: (int) $row['persistence'],
                bullets: array_map(
                    fn (string $bullet): ReviewBullet => $this->toReviewBullet($bullet),
                    $bulletsByReviewId[(int) $row['id']] ?? [],
                ),
                score: null === $row['score'] ? null : (int) $row['score'],
                id: (int) $row['id'],
                createdAt: new \DateTimeImmutable((string) $row['created_at']),
                userName: (string) $row['user_name'],
                userLastname: (string) $row['user_lastname'],
            ),
            $reviewRows,
        );
    }

    private function toIso8601(string $value): string
    {
        return (new \DateTimeImmutable($value))->format(\DateTimeInterface::ATOM);
    }

    private function toReviewBullet(string $value): ReviewBullet
    {
        return match ($value) {
            // Backward compatibility for old Spanish values.
            'afrutado' => ReviewBullet::Afrutado,
            'especiado' => ReviewBullet::Especiado,
            'madera_marcada', 'marked_wood' => ReviewBullet::MaderaMarcada,
            'facil_de_beber' => ReviewBullet::FacilDeBeber,
            'elegante' => ReviewBullet::Elegante,
            'potente' => ReviewBullet::Potente,
            'gastronomico' => ReviewBullet::Gastronomico,
            'fruity' => ReviewBullet::Afrutado,
            'spicy' => ReviewBullet::Especiado,
            'easy_drinking' => ReviewBullet::FacilDeBeber,
            'food_friendly' => ReviewBullet::Gastronomico,
            default => ReviewBullet::from($value),
        };
    }

    private function resolveSortColumn(string $sortBy): string
    {
        return match ($sortBy) {
            ListWinesSort::NAME => 'w.name',
            ListWinesSort::VINTAGE_YEAR => 'w.vintage_year',
            ListWinesSort::UPDATED_AT => 'w.updated_at',
            ListWinesSort::SCORE => 'avg_score',
            default => 'w.created_at',
        };
    }
}
