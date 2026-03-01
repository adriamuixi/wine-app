<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260301090000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Allow creating wine with only name by making winery, wine_type, do_id and country nullable';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('ALTER TABLE wine ALTER COLUMN winery DROP NOT NULL');
        $this->addSql('ALTER TABLE wine ALTER COLUMN wine_type DROP NOT NULL');
        $this->addSql('ALTER TABLE wine ALTER COLUMN do_id DROP NOT NULL');
        $this->addSql('ALTER TABLE wine ALTER COLUMN country DROP NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
INSERT INTO "do" (name, region, country, country_code)
SELECT 'Unknown', 'Unknown', 'spain', 'es'
WHERE NOT EXISTS (SELECT 1 FROM "do")
SQL);

        $this->addSql("UPDATE wine SET winery = '' WHERE winery IS NULL");
        $this->addSql("UPDATE wine SET wine_type = 'red' WHERE wine_type IS NULL");
        $this->addSql("UPDATE wine SET country = 'spain' WHERE country IS NULL");
        $this->addSql('UPDATE wine SET do_id = (SELECT id FROM "do" ORDER BY id LIMIT 1) WHERE do_id IS NULL');

        $this->addSql('ALTER TABLE wine ALTER COLUMN winery SET NOT NULL');
        $this->addSql('ALTER TABLE wine ALTER COLUMN wine_type SET NOT NULL');
        $this->addSql('ALTER TABLE wine ALTER COLUMN do_id SET NOT NULL');
        $this->addSql('ALTER TABLE wine ALTER COLUMN country SET NOT NULL');
    }
}
