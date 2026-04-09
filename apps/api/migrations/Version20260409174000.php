<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260409174000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Populate designation_of_origin.do_logo for Alsace Grand Cru and Snake River Valley';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
UPDATE designation_of_origin AS d
SET do_logo = v.do_logo
FROM (
  VALUES
    ('Alsace Grand Cru', 'FR', 'alsace_grand_cru_DO.png'),
    ('Snake River Valley', 'US', 'snake_river_valley_DO.png')
) AS v(name, country_code, do_logo)
WHERE d.name = v.name
  AND d.country_code = v.country_code
  AND d.do_logo IS DISTINCT FROM v.do_logo
SQL);
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
UPDATE designation_of_origin AS d
SET do_logo = NULL
FROM (
  VALUES
    ('Alsace Grand Cru', 'FR', 'alsace_grand_cru_DO.png'),
    ('Snake River Valley', 'US', 'snake_river_valley_DO.png')
) AS v(name, country_code, do_logo)
WHERE d.name = v.name
  AND d.country_code = v.country_code
  AND d.do_logo = v.do_logo
SQL);
    }
}
