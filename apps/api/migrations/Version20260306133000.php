<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260306133000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Rename Chacolí de Bizkaia – Bizkaiko Txacolina to Bizkaiko Txacolina';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
UPDATE "do"
SET name = 'Bizkaiko Txacolina'
WHERE country = 'spain'::country
  AND region = 'País Vasco'
  AND name = 'Chacolí de Bizkaia – Bizkaiko Txacolina'
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
SET name = 'Chacolí de Bizkaia – Bizkaiko Txacolina'
WHERE country = 'spain'::country
  AND region = 'País Vasco'
  AND name = 'Bizkaiko Txacolina'
SQL);
    }
}
