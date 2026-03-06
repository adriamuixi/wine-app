<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260306120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Populate do.logo_image for filenames that match the normalized DO naming convention';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
UPDATE "do" AS d
SET logo_image = v.logo_image
FROM (
  VALUES
    ('Jumilla', 'jumilla_DO.jpg'),
    ('Rioja', 'rioja_DO.png'),
    ('Condado de Huelva', 'condado_de_huelva_DO.png'),
    ('Granada', 'granada_DO.png'),
    ('Lebrija', 'lebrija_DO.png'),
    ('Málaga', 'malaga_DO.png'),
    ('Manzanilla Sanlúcar de Barrameda', 'manzanilla_sanlucar_de_barrameda_DO.jpg'),
    ('Montilla-Moriles', 'montilla_moriles_DO.jpg'),
    ('Sierras de Málaga', 'sierras_de_malaga_DO.png'),
    ('Aylés', 'ayles_DO.jpg'),
    ('Calatayud', 'calatayud_DO.jpg'),
    ('Campo de Borja', 'campo_de_borja_DO.jpg'),
    ('Somontano', 'somontano_DO.jpg'),
    ('Urbezo', 'urbezo_DO.jpg'),
    ('Cangas', 'cangas_DO.jpg'),
    ('Abona', 'abona_DO.png'),
    ('Gran Canaria', 'gran_canaria_DO.jpg'),
    ('Islas Canarias', 'islas_canarias_DO.png'),
    ('La Gomera', 'la_gomera_DO.png'),
    ('La Palma', 'la_palma_DO.png'),
    ('Lanzarote', 'lanzarote_DO.png'),
    ('Valle de Güimar', 'valle_de_guimar_DO.png'),
    ('Ycoden-Daute-Isora', 'ycoden_daute_isora_DO.jpg'),
    ('Almansa', 'almansa_DO.png'),
    ('Campo de la Guardia', 'campo_de_la_guardia_DO.png'),
    ('Casa del Blanco', 'casa_del_blanco_DO.jpg'),
    ('Dehesa del Carrizal', 'dehesa_del_carrizal_DO.jpg'),
    ('Dominio de Valdepusa', 'dominio_de_valdepusa_DO.png'),
    ('El Vicario', 'el_vicario_DO.jpg'),
    ('Guijoso', 'guijoso_DO.jpg'),
    ('La Mancha', 'la_mancha_DO.png'),
    ('Abadía Retuerta', 'abadia_retuerta_DO.jpg'),
    ('Arlanza', 'arlanza_DO.jpg'),
    ('Cigales', 'cigales_DO.png'),
    ('Ribera del Duero', 'ribera_del_duero_DO.png'),
    ('Toro', 'toro_DO.jpg'),
    ('Alella', 'alella_DO.png'),
    ('Conca de Barberà', 'conca_de_barbera_DO.jpg'),
    ('Costers del Segre', 'costers_del_segre_DO.png'),
    ('Empordà', 'emporda_DO.png'),
    ('Penedés', 'penedes_DO.png'),
    ('Pla de Bages', 'pla_de_bages_DO.png'),
    ('Priorat', 'priorat_DO.png'),
    ('Tarragona', 'tarragona_DO.png'),
    ('Terra Alta', 'terra_alta_DO.png'),
    ('Navarra', 'navarra_DO.jpg'),
    ('Alicante', 'alicante_DO.png')
) AS v(name, logo_image)
WHERE d.name = v.name
  AND d.logo_image IS DISTINCT FROM v.logo_image
SQL);
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
UPDATE "do" AS d
SET logo_image = v.logo_image
FROM (
  VALUES
    ('Rioja', 'rioja_DO.png'),
    ('Calatayud', 'calatayud_DO.jpg'),
    ('Somontano', 'somontano_DO.jpg'),
    ('Arlanza', 'arlanza_DO.jpg'),
    ('Cigales', 'cigales_DO.png'),
    ('Ribera del Duero', 'ribera_del_duero_DO.png'),
    ('Toro', 'toro_DO.jpg'),
    ('Alella', 'alella_DO.png'),
    ('Conca de Barberà', 'conca_de_barbera_DO.jpg'),
    ('Costers del Segre', 'costers_del_segre_DO.png'),
    ('Empordà', 'emporda_DO.png'),
    ('Pla de Bages', 'pla_de_bages_DO.png'),
    ('Priorat', 'priorat_DO.png'),
    ('Tarragona', 'tarragona_DO.png'),
    ('Terra Alta', 'terra_alta_DO.png'),
    ('Navarra', 'navarra_DO.jpg')
) AS v(name, logo_image)
WHERE d.name = v.name
SQL);

        $this->addSql(<<<'SQL'
UPDATE "do"
SET logo_image = NULL
WHERE name IN (
    'Jumilla',
    'Condado de Huelva',
    'Granada',
    'Lebrija',
    'Málaga',
    'Manzanilla Sanlúcar de Barrameda',
    'Montilla-Moriles',
    'Sierras de Málaga',
    'Aylés',
    'Campo de Borja',
    'Urbezo',
    'Cangas',
    'Abona',
    'Gran Canaria',
    'Islas Canarias',
    'La Gomera',
    'La Palma',
    'Lanzarote',
    'Valle de Güimar',
    'Ycoden-Daute-Isora',
    'Almansa',
    'Campo de la Guardia',
    'Casa del Blanco',
    'Dehesa del Carrizal',
    'Dominio de Valdepusa',
    'El Vicario',
    'Guijoso',
    'La Mancha',
    'Abadía Retuerta',
    'Penedés',
    'Alicante'
)
SQL);
    }
}
