<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260301110000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Rename award table to wine_award';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('ALTER TABLE award RENAME TO wine_award');
        $this->addSql('ALTER INDEX award_wine_name_year_idx RENAME TO wine_award_wine_name_year_idx');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('ALTER INDEX wine_award_wine_name_year_idx RENAME TO award_wine_name_year_idx');
        $this->addSql('ALTER TABLE wine_award RENAME TO award');
    }
}
