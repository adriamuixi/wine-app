<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260227175847 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Seed DO table with United States appellations';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
INSERT INTO "do" (name, region, country, country_code)
VALUES
  ('Napa Valley', 'California', 'united_states'::country, 'US'),
  ('Sonoma Valley', 'California', 'united_states'::country, 'US'),
  ('Russian River Valley', 'California', 'united_states'::country, 'US'),
  ('Stags Leap District', 'California', 'united_states'::country, 'US'),
  ('Oakville', 'California', 'united_states'::country, 'US'),
  ('Rutherford', 'California', 'united_states'::country, 'US'),
  ('Paso Robles', 'California', 'united_states'::country, 'US'),
  ('Santa Lucia Highlands', 'California', 'united_states'::country, 'US'),
  ('Sta. Rita Hills', 'California', 'united_states'::country, 'US'),
  ('Santa Cruz Mountains', 'California', 'united_states'::country, 'US'),
  ('Willamette Valley', 'Oregon', 'united_states'::country, 'US'),
  ('Dundee Hills', 'Oregon', 'united_states'::country, 'US'),
  ('Columbia Valley', 'Washington', 'united_states'::country, 'US'),
  ('Walla Walla Valley', 'Washington', 'united_states'::country, 'US'),
  ('Horse Heaven Hills', 'Washington', 'united_states'::country, 'US'),
  ('Red Mountain', 'Washington', 'united_states'::country, 'US'),
  ('Finger Lakes', 'New York', 'united_states'::country, 'US'),
  ('Texas Hill Country', 'Texas', 'united_states'::country, 'US'),
  ('Monticello', 'Virginia', 'united_states'::country, 'US'),
  ('Snake River Valley', 'Idaho', 'united_states'::country, 'US')
ON CONFLICT (country, name)
DO UPDATE SET
  region = EXCLUDED.region,
  country_code = EXCLUDED.country_code
SQL);
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
DELETE FROM "do"
WHERE country = 'united_states'::country
  AND name IN (
    'Napa Valley', 'Sonoma Valley', 'Russian River Valley', 'Stags Leap District', 'Oakville',
    'Rutherford', 'Paso Robles', 'Santa Lucia Highlands', 'Sta. Rita Hills', 'Santa Cruz Mountains',
    'Willamette Valley', 'Dundee Hills', 'Columbia Valley', 'Walla Walla Valley', 'Horse Heaven Hills',
    'Red Mountain', 'Finger Lakes', 'Texas Hill Country', 'Monticello', 'Snake River Valley'
  )
SQL);
    }
}
