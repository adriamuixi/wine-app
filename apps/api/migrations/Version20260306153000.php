<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260306153000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Apply approved DO logo_image exception mappings and rename La Jaraba to Pago La Jaraba';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
UPDATE "do"
SET name = 'Pago La Jaraba'
WHERE country = 'spain'::country
  AND name = 'La Jaraba'
SQL);

        $this->addSql(<<<'SQL'
UPDATE "do" AS d
SET logo_image = v.logo_image
FROM (
  VALUES
    ('Cataluña', 'catalunya_DO.jpg'),
    ('Mondéjar', 'mondejar.png'),
    ('Pago Finca Bolandín (Cirsus)', 'pago_finca_bolandín_(cirsus).png'),
    ('Pago La Jaraba', 'pago_la_jaraba_DO.png'),
    ('Utiel-Requena', 'utiel-requena_DO.jpg'),
    ('Valdepeñas', 'valdepanas_DO.jpg'),
    ('Valles de Benavente', 'valles_de_benavente.jpeg')
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
    'Cataluña',
    'Mondéjar',
    'Pago Finca Bolandín (Cirsus)',
    'Pago La Jaraba',
    'Utiel-Requena',
    'Valdepeñas',
    'Valles de Benavente'
)
SQL);

        $this->addSql(<<<'SQL'
UPDATE "do"
SET name = 'La Jaraba'
WHERE country = 'spain'::country
  AND name = 'Pago La Jaraba'
SQL);
    }
}
