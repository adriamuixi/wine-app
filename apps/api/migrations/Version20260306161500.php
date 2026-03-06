<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260306161500 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Set do.logo_image for Rosalejo from the matching DO icon file';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
UPDATE "do"
SET logo_image = 'rosalejo_DO.png'
WHERE name = 'Rosalejo'
  AND logo_image IS DISTINCT FROM 'rosalejo_DO.png'
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
SET logo_image = NULL
WHERE name = 'Rosalejo'
  AND logo_image = 'rosalejo_DO.png'
SQL);
    }
}
