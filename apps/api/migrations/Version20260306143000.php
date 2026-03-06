<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260306143000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Rename Pago Finca Bolandín to Pago Finca Bolandín (Cirsus)';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
UPDATE "do"
SET name = 'Pago Finca Bolandín (Cirsus)'
WHERE country = 'spain'::country
  AND name = 'Pago Finca Bolandín'
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
SET name = 'Pago Finca Bolandín'
WHERE country = 'spain'::country
  AND name = 'Pago Finca Bolandín (Cirsus)'
SQL);
    }
}
