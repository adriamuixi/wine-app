<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260306170000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Rename selected Chilean valley DO names to Spanish and link normalized logo_image filenames';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
UPDATE "do"
SET name = CASE name
    WHEN 'Cachapoal Valley' THEN 'Valle de Cachapoal'
    WHEN 'Casablanca Valley' THEN 'Valle de Casablanca'
    WHEN 'Colchagua Valley' THEN 'Valle de Colchagua'
    WHEN 'Limarí Valley' THEN 'Valle del Limarí'
    WHEN 'Maipo Valley' THEN 'Valle del Maipo'
    WHEN 'Maule Valley' THEN 'Valle del Maule'
    WHEN 'San Antonio Valley' THEN 'Valle de San Antonio'
    ELSE name
END
WHERE name IN (
    'Cachapoal Valley',
    'Casablanca Valley',
    'Colchagua Valley',
    'Limarí Valley',
    'Maipo Valley',
    'Maule Valley',
    'San Antonio Valley'
)
SQL);

        $this->addSql(<<<'SQL'
UPDATE "do" AS d
SET logo_image = v.logo_image
FROM (
  VALUES
    ('Valle de Cachapoal', 'valle_de_cachapoal_DO.png'),
    ('Valle de Casablanca', 'valle_de_casablanca_DO.png'),
    ('Valle de Colchagua', 'valle_de_colchagua_DO.jpeg'),
    ('Valle del Limarí', 'valle_del_limarí_DO.jpeg'),
    ('Valle del Maipo', 'valle_del_maipo_DO.png'),
    ('Valle del Maule', 'valle_del_maule_DO.jpeg'),
    ('Valle de San Antonio', 'valle_de_san_antonio_DO.jpeg')
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
UPDATE "do"
SET logo_image = NULL
WHERE name IN (
    'Valle de Cachapoal',
    'Valle de Casablanca',
    'Valle de Colchagua',
    'Valle del Limarí',
    'Valle del Maipo',
    'Valle del Maule',
    'Valle de San Antonio'
)
SQL);

        $this->addSql(<<<'SQL'
UPDATE "do"
SET name = CASE name
    WHEN 'Valle de Cachapoal' THEN 'Cachapoal Valley'
    WHEN 'Valle de Casablanca' THEN 'Casablanca Valley'
    WHEN 'Valle de Colchagua' THEN 'Colchagua Valley'
    WHEN 'Valle del Limarí' THEN 'Limarí Valley'
    WHEN 'Valle del Maipo' THEN 'Maipo Valley'
    WHEN 'Valle del Maule' THEN 'Maule Valley'
    WHEN 'Valle de San Antonio' THEN 'San Antonio Valley'
    ELSE name
END
WHERE name IN (
    'Valle de Cachapoal',
    'Valle de Casablanca',
    'Valle de Colchagua',
    'Valle del Limarí',
    'Valle del Maipo',
    'Valle del Maule',
    'Valle de San Antonio'
)
SQL);
    }
}
