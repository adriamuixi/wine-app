<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260322120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add Parraleta red grape variety.';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
INSERT INTO grape (name, color)
VALUES ('Parraleta', 'red'::grape_color)
ON CONFLICT (name)
DO UPDATE SET color = EXCLUDED.color
SQL);
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
DELETE FROM grape g
WHERE g.name = 'Parraleta'
  AND g.color = 'red'::grape_color
  AND NOT EXISTS (
    SELECT 1
    FROM wine_grape wg
    WHERE wg.grape_id = g.id
  )
SQL);
    }
}
