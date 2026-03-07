<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260307113000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Populate do.region_logo for Spanish DO regions from shared region flag assets';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
UPDATE "do"
SET region_logo = CASE region
    WHEN 'Andalucía' THEN 'andalucia.png'
    WHEN 'Aragón' THEN 'aragon.png'
    WHEN 'Asturias' THEN 'asturias.png'
    WHEN 'Canarias' THEN 'canarias.png'
    WHEN 'Castilla y León' THEN 'castilla_y_leon.png'
    WHEN 'Castilla-La Mancha' THEN 'castilla_la_mancha.png'
    WHEN 'Cataluña' THEN 'cataluna.png'
    WHEN 'Comunidad Valenciana' THEN 'comunidad_valenciana.png'
    WHEN 'Extremadura' THEN 'extremadura.png'
    WHEN 'Galicia' THEN 'galicia.png'
    WHEN 'Islas Baleares' THEN 'baleares.png'
    WHEN 'La Rioja' THEN 'la_rioja.png'
    WHEN 'Madrid' THEN 'madrid.png'
    WHEN 'Murcia' THEN 'murcia.png'
    WHEN 'Navarra' THEN 'navarra.png'
    WHEN 'País Vasco' THEN 'pais_vasco.png'
    ELSE region_logo
END
WHERE country = 'spain'::country
  AND region IN (
    'Andalucía',
    'Aragón',
    'Asturias',
    'Canarias',
    'Castilla y León',
    'Castilla-La Mancha',
    'Cataluña',
    'Comunidad Valenciana',
    'Extremadura',
    'Galicia',
    'Islas Baleares',
    'La Rioja',
    'Madrid',
    'Murcia',
    'Navarra',
    'País Vasco'
  )
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
SET region_logo = NULL
WHERE country = 'spain'::country
  AND region_logo IN (
    'andalucia.png',
    'aragon.png',
    'asturias.png',
    'canarias.png',
    'castilla_y_leon.png',
    'castilla_la_mancha.png',
    'cataluna.png',
    'comunidad_valenciana.png',
    'extremadura.png',
    'galicia.png',
    'baleares.png',
    'la_rioja.png',
    'madrid.png',
    'murcia.png',
    'navarra.png',
    'pais_vasco.png'
  )
SQL);
    }
}
