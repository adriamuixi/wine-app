<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260301100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Initialize place table with default supermarket and restaurant records';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
INSERT INTO place (place_type, name, address, city, country)
SELECT 'supermarket', 'Supermarket Default', NULL, NULL, 'spain'
WHERE NOT EXISTS (
    SELECT 1 FROM place WHERE place_type = 'supermarket' AND name = 'Supermarket Default'
)
SQL);

        $this->addSql(<<<'SQL'
INSERT INTO place (place_type, name, address, city, country)
SELECT 'restaurant', 'Restaurant Default', 'Calle Default 1', 'Madrid', 'spain'
WHERE NOT EXISTS (
    SELECT 1 FROM place WHERE place_type = 'restaurant' AND name = 'Restaurant Default'
)
SQL);
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql("DELETE FROM place WHERE place_type = 'supermarket' AND name = 'Supermarket Default'");
        $this->addSql("DELETE FROM place WHERE place_type = 'restaurant' AND name = 'Restaurant Default'");
    }
}
