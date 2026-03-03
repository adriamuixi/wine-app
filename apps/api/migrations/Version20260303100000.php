<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260303100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add do.logo_image column and seed known DO logo filenames';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('ALTER TABLE "do" ADD COLUMN logo_image VARCHAR(255) DEFAULT NULL');

        $this->addSql(<<<'SQL'
UPDATE "do" AS d
SET logo_image = v.logo_image
FROM (
  VALUES
    ('Penedès', 'penedes_DO.png'),
    ('Montsant', 'montanst_DO.png'),
    ('Ribera del Duero', 'ribera_del_duero_DO.png'),
    ('Somontano', 'somontano_DO.jpg'),
    ('Toro', 'toro_DO.jpg'),
    ('Rioja', 'rioja_DO.png'),
    ('Tarragona', 'tarragona_DO.png'),
    ('Terra Alta', 'terra_alta_DO.png'),
    ('Priorat', 'priorat_DO.png'),
    ('Conca de Barberà', 'conca_de_barbera_DO.jpg'),
    ('Pla de Bages', 'pla_de_bages_DO.png'),
    ('Alella', 'alella_DO.png'),
    ('Empordà', 'emporda_DO.png'),
    ('Navarra', 'navarra_DO.jpg'),
    ('Cariñena', 'cariñena_DO.png'),
    ('Calatayud', 'calatayud_DO.jpg'),
    ('Cigales', 'cigales_DO.png'),
    ('Arlanza', 'arlanza_DO.jpg'),
    ('Costers del Segre', 'costers_del_segre_DO.png'),
    ('Rías Baixas', 'logo-rias_baixas_DO.png')
) AS v(name, logo_image)
WHERE d.name = v.name
SQL);
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('ALTER TABLE "do" DROP COLUMN logo_image');
    }
}
