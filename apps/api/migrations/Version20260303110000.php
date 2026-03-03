<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260303110000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add situation value to photo_type enum';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql("ALTER TYPE photo_type ADD VALUE IF NOT EXISTS 'situation'");
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        // PostgreSQL does not support removing a single enum value directly.
        $this->addSql("UPDATE wine_photo SET type = 'bottle'::photo_type WHERE type = 'situation'::photo_type");
        $this->addSql("ALTER TYPE photo_type RENAME TO photo_type_old");
        $this->addSql("CREATE TYPE photo_type AS ENUM ('front_label', 'back_label', 'bottle')");
        $this->addSql("ALTER TABLE wine_photo ALTER COLUMN type TYPE photo_type USING (type::text::photo_type)");
        $this->addSql('DROP TYPE photo_type_old');
    }
}
