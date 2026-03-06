<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260306130000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Align DO logo_image values with normalized filenames derived from do.name';
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
    ('Arribes', 'arribes_DO.png'),
    ('Campo de Calatrava', 'campo_de_calatraba_DO.png'),
    ('El Hierro', 'el_hierro_DO.png'),
    ('Jerez-Xérès-Sherry', 'jerez_xerez_sherry_DO.jpg'),
    ('Montsant', 'montsant_DO.png'),
    ('Pago El Vicario', 'pago_el_vicario_DO.jpg'),
    ('Pago Finca Élez', 'pago_finca_elez_DO.jpg'),
    ('Pago Guijoso', 'pago_guijoso_DO.jpg'),
    ('Pago Los Cerrillos', 'pago_los_cerrillos_DO.png'),
    ('Rías Baixas', 'rias_baixas_DO.png'),
    ('Tacoronte-Acentejo', 'tacoronte_acentejo_DO.jpg'),
    ('Valle de la Orotava', 'valle_de_orotava_DO.png')
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
    ('Montsant', 'montanst_DO.png'),
    ('Pago El Vicario', 'el_vicario_DO.jpg'),
    ('Pago Guijoso', 'guijoso_DO.jpg'),
    ('Rías Baixas', 'logo-rias_baixas_DO.png')
) AS v(name, logo_image)
WHERE d.name = v.name
SQL);

        $this->addSql(<<<'SQL'
UPDATE "do"
SET logo_image = NULL
WHERE name IN (
    'Arribes',
    'Campo de Calatrava',
    'El Hierro',
    'Jerez-Xérès-Sherry',
    'Pago Finca Élez',
    'Pago Los Cerrillos',
    'Tacoronte-Acentejo',
    'Valle de la Orotava'
)
SQL);
    }
}
