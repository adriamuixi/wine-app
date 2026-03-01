<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260301120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Enforce one wine photo per type with unique index on wine_photo(wine_id, type)';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
DELETE FROM wine_photo wp
USING wine_photo keep
WHERE wp.wine_id = keep.wine_id
  AND wp.type = keep.type
  AND wp.id < keep.id
  AND wp.type IS NOT NULL
SQL);

        $this->addSql('DROP INDEX IF EXISTS wine_photo_wine_type_idx');
        $this->addSql('CREATE UNIQUE INDEX wine_photo_wine_type_unique_idx ON wine_photo (wine_id, type) WHERE type IS NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('DROP INDEX IF EXISTS wine_photo_wine_type_unique_idx');
        $this->addSql('CREATE INDEX wine_photo_wine_type_idx ON wine_photo (wine_id, type)');
    }
}
