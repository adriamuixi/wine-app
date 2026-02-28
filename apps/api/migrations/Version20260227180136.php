<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260227180136 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Seed DO table with LATAM, South Africa, Australia, Germany, Italy, and Portugal appellations';
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
  ('Maipo Valley', 'Central Valley', 'chile'::country, 'CL'),
  ('Colchagua Valley', 'Central Valley', 'chile'::country, 'CL'),
  ('Casablanca Valley', 'Aconcagua', 'chile'::country, 'CL'),
  ('San Antonio Valley', 'Aconcagua', 'chile'::country, 'CL'),
  ('Limarí Valley', 'Coquimbo', 'chile'::country, 'CL'),
  ('Maule Valley', 'Central Valley', 'chile'::country, 'CL'),
  ('Cachapoal Valley', 'Central Valley', 'chile'::country, 'CL'),
  ('Mendoza', 'Cuyo', 'argentina'::country, 'AR'),
  ('Valle de Uco', 'Mendoza', 'argentina'::country, 'AR'),
  ('Luján de Cuyo', 'Mendoza', 'argentina'::country, 'AR'),
  ('Maipú', 'Mendoza', 'argentina'::country, 'AR'),
  ('Cafayate', 'Salta', 'argentina'::country, 'AR'),
  ('San Juan', 'Cuyo', 'argentina'::country, 'AR'),
  ('Neuquén', 'Patagonia', 'argentina'::country, 'AR'),
  ('Stellenbosch', 'Coastal Region', 'south_africa'::country, 'ZA'),
  ('Paarl', 'Coastal Region', 'south_africa'::country, 'ZA'),
  ('Swartland', 'Coastal Region', 'south_africa'::country, 'ZA'),
  ('Constantia', 'Coastal Region', 'south_africa'::country, 'ZA'),
  ('Walker Bay', 'Cape South Coast', 'south_africa'::country, 'ZA'),
  ('Franschhoek', 'Coastal Region', 'south_africa'::country, 'ZA'),
  ('Elgin', 'Cape South Coast', 'south_africa'::country, 'ZA'),
  ('Barossa Valley', 'South Australia', 'australia'::country, 'AU'),
  ('McLaren Vale', 'South Australia', 'australia'::country, 'AU'),
  ('Hunter Valley', 'New South Wales', 'australia'::country, 'AU'),
  ('Margaret River', 'Western Australia', 'australia'::country, 'AU'),
  ('Yarra Valley', 'Victoria', 'australia'::country, 'AU'),
  ('Coonawarra', 'South Australia', 'australia'::country, 'AU'),
  ('Adelaide Hills', 'South Australia', 'australia'::country, 'AU'),
  ('Clare Valley', 'South Australia', 'australia'::country, 'AU'),
  ('Mosel', 'Mosel', 'germany'::country, 'DE'),
  ('Rheingau', 'Rheingau', 'germany'::country, 'DE'),
  ('Pfalz', 'Pfalz', 'germany'::country, 'DE'),
  ('Rheinhessen', 'Rheinhessen', 'germany'::country, 'DE'),
  ('Baden', 'Baden', 'germany'::country, 'DE'),
  ('Franken', 'Franken', 'germany'::country, 'DE'),
  ('Nahe', 'Nahe', 'germany'::country, 'DE'),
  ('Barolo', 'Piedmont', 'italy'::country, 'IT'),
  ('Barbaresco', 'Piedmont', 'italy'::country, 'IT'),
  ('Brunello di Montalcino', 'Tuscany', 'italy'::country, 'IT'),
  ('Chianti Classico', 'Tuscany', 'italy'::country, 'IT'),
  ('Bolgheri', 'Tuscany', 'italy'::country, 'IT'),
  ('Amarone della Valpolicella', 'Veneto', 'italy'::country, 'IT'),
  ('Etna', 'Sicily', 'italy'::country, 'IT'),
  ('Taurasi', 'Campania', 'italy'::country, 'IT'),
  ('Franciacorta', 'Lombardy', 'italy'::country, 'IT'),
  ('Douro', 'Douro', 'portugal'::country, 'PT'),
  ('Alentejo', 'Alentejo', 'portugal'::country, 'PT'),
  ('Vinho Verde', 'Minho', 'portugal'::country, 'PT'),
  ('Dão', 'Beira Alta', 'portugal'::country, 'PT'),
  ('Madeira', 'Madeira', 'portugal'::country, 'PT')
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
WHERE country IN ('chile'::country, 'argentina'::country, 'south_africa'::country, 'australia'::country, 'germany'::country, 'italy'::country, 'portugal'::country)
  AND name IN (
    'Maipo Valley', 'Colchagua Valley', 'Casablanca Valley', 'San Antonio Valley', 'Limarí Valley', 'Maule Valley', 'Cachapoal Valley',
    'Mendoza', 'Valle de Uco', 'Luján de Cuyo', 'Maipú', 'Cafayate', 'San Juan', 'Neuquén',
    'Stellenbosch', 'Paarl', 'Swartland', 'Constantia', 'Walker Bay', 'Franschhoek', 'Elgin',
    'Barossa Valley', 'McLaren Vale', 'Hunter Valley', 'Margaret River', 'Yarra Valley', 'Coonawarra', 'Adelaide Hills', 'Clare Valley',
    'Mosel', 'Rheingau', 'Pfalz', 'Rheinhessen', 'Baden', 'Franken', 'Nahe',
    'Barolo', 'Barbaresco', 'Brunello di Montalcino', 'Chianti Classico', 'Bolgheri', 'Amarone della Valpolicella', 'Etna', 'Taurasi', 'Franciacorta',
    'Douro', 'Alentejo', 'Vinho Verde', 'Dão', 'Madeira'
  )
SQL);
    }
}
