<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260315103000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Allow optional place address and city for all place types.';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('ALTER TABLE place DROP CONSTRAINT IF EXISTS place_fields_by_type_chk');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('ALTER TABLE place DROP CONSTRAINT IF EXISTS place_fields_by_type_chk');
        $this->addSql(<<<'SQL'
ALTER TABLE place
ADD CONSTRAINT place_fields_by_type_chk CHECK (
  (place_type = 'supermarket' AND address IS NULL) OR
  (place_type = 'restaurant' AND address IS NOT NULL AND city IS NOT NULL)
)
SQL);
    }
}
