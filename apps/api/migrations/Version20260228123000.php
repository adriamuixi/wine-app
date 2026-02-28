<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260228123000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Drop winery column from wine table and replace winery composite index';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('DROP INDEX IF EXISTS wine_winery_name_vintage_idx');
        $this->addSql('ALTER TABLE wine DROP COLUMN IF EXISTS winery');
        $this->addSql('CREATE INDEX wine_name_vintage_idx ON wine (name, vintage_year)');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql("ALTER TABLE wine ADD COLUMN winery VARCHAR(255) NOT NULL DEFAULT ''");
        $this->addSql('DROP INDEX IF EXISTS wine_name_vintage_idx');
        $this->addSql('CREATE INDEX wine_winery_name_vintage_idx ON wine (winery, name, vintage_year)');
        $this->addSql('ALTER TABLE wine ALTER COLUMN winery DROP DEFAULT');
    }
}
