<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260314200000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Set designation_of_origin.do_logo for Sonoma Valley (id 132).';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
UPDATE designation_of_origin
SET do_logo = 'sonoma_valley_DO.png'
WHERE id = 132
  AND name = 'Sonoma Valley'
  AND do_logo IS DISTINCT FROM 'sonoma_valley_DO.png'
SQL);
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
UPDATE designation_of_origin
SET do_logo = NULL
WHERE id = 132
  AND name = 'Sonoma Valley'
  AND do_logo = 'sonoma_valley_DO.png'
SQL);
    }
}
