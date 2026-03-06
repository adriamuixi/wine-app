<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260306154500 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Set do.logo_image for Yecla from the matching DO icon file';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
UPDATE "do"
SET logo_image = 'yecla_DO.jpg'
WHERE name = 'Yecla'
  AND logo_image IS DISTINCT FROM 'yecla_DO.jpg'
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
WHERE name = 'Yecla'
  AND logo_image = 'yecla_DO.jpg'
SQL);
    }
}
