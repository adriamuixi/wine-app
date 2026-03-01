<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260301113000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Rename photo table to wine_photo and add hash, size and extension fields';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('ALTER TABLE photo RENAME TO wine_photo');
        $this->addSql("ALTER TABLE wine_photo ADD COLUMN hash VARCHAR(64) NOT NULL DEFAULT ''");
        $this->addSql("ALTER TABLE wine_photo ADD COLUMN size BIGINT NOT NULL DEFAULT 0");
        $this->addSql("ALTER TABLE wine_photo ADD COLUMN extension VARCHAR(10) NOT NULL DEFAULT ''");
        $this->addSql('CREATE INDEX wine_photo_wine_type_idx ON wine_photo (wine_id, type)');

        $this->addSql('ALTER TABLE wine_photo ALTER COLUMN hash DROP DEFAULT');
        $this->addSql('ALTER TABLE wine_photo ALTER COLUMN size DROP DEFAULT');
        $this->addSql('ALTER TABLE wine_photo ALTER COLUMN extension DROP DEFAULT');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('DROP INDEX IF EXISTS wine_photo_wine_type_idx');
        $this->addSql('ALTER TABLE wine_photo DROP COLUMN IF EXISTS extension');
        $this->addSql('ALTER TABLE wine_photo DROP COLUMN IF EXISTS size');
        $this->addSql('ALTER TABLE wine_photo DROP COLUMN IF EXISTS hash');
        $this->addSql('ALTER TABLE wine_photo RENAME TO photo');
    }
}
