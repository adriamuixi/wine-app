<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260314163000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Backfill do.map_data for existing denominations of origin using validated region centroids';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
WITH region_centroids(country, region, lat, lng, zoom) AS (
    VALUES
        ('argentina', 'Cuyo', -32.900000, -68.700000, 7),
        ('argentina', 'Mendoza', -33.100000, -68.500000, 8),
        ('argentina', 'Patagonia', -39.500000, -68.500000, 6),
        ('argentina', 'Salta', -25.500000, -65.400000, 7),
        ('australia', 'New South Wales', -32.100000, 149.500000, 6),
        ('australia', 'South Australia', -34.800000, 138.600000, 7),
        ('australia', 'Victoria', -37.300000, 145.000000, 7),
        ('australia', 'Western Australia', -33.900000, 115.900000, 6),
        ('chile', 'Aconcagua', -32.900000, -71.300000, 8),
        ('chile', 'Central Valley', -35.000000, -71.000000, 7),
        ('chile', 'Coquimbo', -30.000000, -70.600000, 7),
        ('france', 'Alsace', 48.200000, 7.400000, 9),
        ('france', 'Beaujolais', 46.100000, 4.600000, 9),
        ('france', 'Bordeaux', 44.800000, -0.600000, 8),
        ('france', 'Bourgogne', 47.100000, 4.800000, 8),
        ('france', 'Champagne', 49.100000, 4.000000, 8),
        ('france', 'Languedoc-Roussillon', 43.600000, 3.700000, 7),
        ('france', 'Provence', 43.700000, 6.100000, 8),
        ('france', 'Sud-Ouest', 44.300000, 0.700000, 7),
        ('france', 'Vallée du Loire', 47.300000, -1.000000, 7),
        ('france', 'Vallée du Rhône', 44.300000, 4.900000, 7),
        ('germany', 'Baden', 48.300000, 8.000000, 8),
        ('germany', 'Franken', 49.800000, 10.100000, 8),
        ('germany', 'Mosel', 49.800000, 6.900000, 8),
        ('germany', 'Nahe', 49.800000, 7.800000, 8),
        ('germany', 'Pfalz', 49.300000, 8.100000, 8),
        ('germany', 'Rheingau', 50.000000, 8.100000, 8),
        ('germany', 'Rheinhessen', 49.900000, 8.100000, 8),
        ('italy', 'Campania', 40.900000, 14.900000, 7),
        ('italy', 'Lombardy', 45.600000, 9.800000, 7),
        ('italy', 'Piedmont', 44.800000, 7.800000, 8),
        ('italy', 'Sicily', 37.600000, 14.100000, 7),
        ('italy', 'Tuscany', 43.400000, 11.000000, 7),
        ('italy', 'Veneto', 45.600000, 11.700000, 7),
        ('portugal', 'Alentejo', 38.200000, -7.900000, 7),
        ('portugal', 'Beira Alta', 40.700000, -7.800000, 8),
        ('portugal', 'Douro', 41.200000, -7.500000, 8),
        ('portugal', 'Madeira', 32.750000, -16.950000, 9),
        ('portugal', 'Minho', 41.800000, -8.400000, 8),
        ('south_africa', 'Cape South Coast', -34.200000, 19.500000, 7),
        ('south_africa', 'Coastal Region', -33.900000, 18.800000, 7),
        ('spain', 'Andalucía', 37.400000, -4.500000, 7),
        ('spain', 'Aragón', 41.700000, -0.800000, 8),
        ('spain', 'Asturias', 43.300000, -6.000000, 9),
        ('spain', 'Canarias', 28.400000, -16.300000, 7),
        ('spain', 'Castilla y León', 41.700000, -4.800000, 8),
        ('spain', 'Castilla-La Mancha', 39.500000, -3.000000, 8),
        ('spain', 'Cataluña', 41.800000, 1.500000, 8),
        ('spain', 'Comunidad Valenciana', 39.400000, -0.500000, 8),
        ('spain', 'Extremadura', 39.000000, -6.000000, 8),
        ('spain', 'Galicia', 42.800000, -8.500000, 8),
        ('spain', 'Islas Baleares', 39.600000, 2.900000, 8),
        ('spain', 'La Rioja', 42.300000, -2.500000, 9),
        ('spain', 'Madrid', 40.400000, -3.700000, 9),
        ('spain', 'Murcia', 38.000000, -1.300000, 9),
        ('spain', 'Navarra', 42.700000, -1.600000, 9),
        ('spain', 'País Vasco', 43.000000, -2.600000, 9),
        ('spain', 'Test Region', 40.400000, -3.700000, 7),
        ('united_states', 'California', 37.200000, -121.500000, 6),
        ('united_states', 'Idaho', 43.600000, -116.200000, 7),
        ('united_states', 'New York', 42.800000, -76.800000, 7),
        ('united_states', 'Oregon', 44.800000, -123.000000, 7),
        ('united_states', 'Texas', 30.200000, -98.800000, 6),
        ('united_states', 'Virginia', 38.000000, -78.400000, 7),
        ('united_states', 'Washington', 46.300000, -120.500000, 7)
),
country_centroids(country, lat, lng, zoom) AS (
    VALUES
        ('argentina', -38.416097, -63.616672, 5),
        ('australia', -25.274398, 133.775136, 4),
        ('chile', -35.675147, -71.542969, 5),
        ('france', 46.227638, 2.213749, 5),
        ('germany', 51.165691, 10.451526, 5),
        ('italy', 41.871940, 12.567380, 5),
        ('portugal', 39.399872, -8.224454, 6),
        ('south_africa', -30.559482, 22.937506, 5),
        ('spain', 40.463667, -3.749220, 6),
        ('united_states', 39.828300, -98.579500, 4)
),
resolved AS (
    SELECT
        d.id,
        COALESCE(r.lat, c.lat) AS base_lat,
        COALESCE(r.lng, c.lng) AS base_lng,
        COALESCE(r.zoom, c.zoom, 5) AS zoom
    FROM "do" d
    LEFT JOIN region_centroids r
        ON r.country = d.country::text
       AND r.region = d.region
    LEFT JOIN country_centroids c
        ON c.country = d.country::text
    WHERE d.map_data IS NULL
)
UPDATE "do" d
SET map_data = jsonb_build_object(
    'lat', round((resolved.base_lat + ((d.id % 5) - 2) * 0.025)::numeric, 6),
    'lng', round((resolved.base_lng + (((d.id / 5) % 5) - 2) * 0.025)::numeric, 6),
    'zoom', resolved.zoom
)
FROM resolved
WHERE d.id = resolved.id
SQL);
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        // Irreversible safely: previous NULL/custom values cannot be reconstructed.
    }
}
