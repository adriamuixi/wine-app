<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260306123000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Rename selected Castilla-La Mancha DO names to include Pago';
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
    WHEN 'Los Cerrillos' THEN 'Pago Los Cerrillos'
    WHEN 'El Vicario' THEN 'Pago El Vicario'
    WHEN 'Finca Élez' THEN 'Pago Finca Élez'
    WHEN 'Guijoso' THEN 'Pago Guijoso'
    ELSE name
END
WHERE country = 'spain'::country
  AND region = 'Castilla-La Mancha'
  AND name IN ('Los Cerrillos', 'El Vicario', 'Finca Élez', 'Guijoso')
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
SET name = CASE name
    WHEN 'Pago Los Cerrillos' THEN 'Los Cerrillos'
    WHEN 'Pago El Vicario' THEN 'El Vicario'
    WHEN 'Pago Finca Élez' THEN 'Finca Élez'
    WHEN 'Pago Guijoso' THEN 'Guijoso'
    ELSE name
END
WHERE country = 'spain'::country
  AND region = 'Castilla-La Mancha'
  AND name IN ('Pago Los Cerrillos', 'Pago El Vicario', 'Pago Finca Élez', 'Pago Guijoso')
SQL);
    }
}
