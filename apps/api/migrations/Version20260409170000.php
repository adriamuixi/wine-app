<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260409170000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Populate designation_of_origin.region_logo for newly added non-Spanish region flag assets';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
UPDATE designation_of_origin AS d
SET region_logo = v.region_logo
FROM (
  VALUES
    ('Alentejo', 'PT', 'alentejo.png'),
    ('Alsace', 'FR', 'alsace.png'),
    ('Baden', 'DE', 'baden.png'),
    ('Beaujolais', 'FR', 'beaujolais.png'),
    ('Beira Alta', 'PT', 'beira_alta.png'),
    ('Bordeaux', 'FR', 'bordeaux.png'),
    ('Bourgogne', 'FR', 'bourgogne.png'),
    ('California', 'US', 'california.png'),
    ('Campania', 'IT', 'campania.png'),
    ('Cape South Coast', 'ZA', 'cape_south_coast.png'),
    ('Central Valley', 'CL', 'central_valley.png'),
    ('Champagne', 'FR', 'champagne.png'),
    ('Coquimbo', 'CL', 'coquimbo.png'),
    ('Cuyo', 'AR', 'cuyo.png'),
    ('Franken', 'DE', 'franken.png'),
    ('Idaho', 'US', 'idaho.png'),
    ('Languedoc-Roussillon', 'FR', 'languedoc_roussillon.png'),
    ('Lombardy', 'IT', 'lombardy.png'),
    ('Madeira', 'PT', 'madeira.png'),
    ('Mendoza', 'AR', 'mendoza.png'),
    ('Minho', 'PT', 'minho.png'),
    ('Mosel', 'DE', 'mosel.png'),
    ('Nahe', 'DE', 'nahe.png'),
    ('New South Wales', 'AU', 'new_south_wales.png'),
    ('New York', 'US', 'new_york.png'),
    ('Oregon', 'US', 'oregon.png'),
    ('Patagonia', 'AR', 'patagonia.png'),
    ('Pfalz', 'DE', 'pfalz.png'),
    ('Piedmont', 'IT', 'piedmont.png'),
    ('Provence', 'FR', 'provence.png'),
    ('Rheingau', 'DE', 'rheingau.png'),
    ('Rheinhessen', 'DE', 'rheinhessen.png'),
    ('Salta', 'AR', 'salta.png'),
    ('Sicily', 'IT', 'sicily.png'),
    ('South Australia', 'AU', 'south_australia.png'),
    ('Sud-Ouest', 'FR', 'sud_ouest.png'),
    ('Texas', 'US', 'texas.png'),
    ('Tuscany', 'IT', 'tuscany.png'),
    ('Vallée du Loire', 'FR', 'vallee_du_loire.png'),
    ('Vallée du Rhône', 'FR', 'vallee_du_rhone.png'),
    ('Veneto', 'IT', 'veneto.png'),
    ('Verona', 'IT', 'verona.png'),
    ('Victoria', 'AU', 'victoria.png'),
    ('Virginia', 'US', 'virginia.png'),
    ('Washington', 'US', 'washington.png'),
    ('Western Australia', 'AU', 'western_australia.png')
) AS v(region, country_code, region_logo)
WHERE d.region = v.region
  AND d.country_code = v.country_code
  AND d.region_logo IS DISTINCT FROM v.region_logo
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
SET region_logo = NULL
FROM (
  VALUES
    ('Alentejo', 'PT', 'alentejo.png'),
    ('Alsace', 'FR', 'alsace.png'),
    ('Baden', 'DE', 'baden.png'),
    ('Beaujolais', 'FR', 'beaujolais.png'),
    ('Beira Alta', 'PT', 'beira_alta.png'),
    ('Bordeaux', 'FR', 'bordeaux.png'),
    ('Bourgogne', 'FR', 'bourgogne.png'),
    ('California', 'US', 'california.png'),
    ('Campania', 'IT', 'campania.png'),
    ('Cape South Coast', 'ZA', 'cape_south_coast.png'),
    ('Central Valley', 'CL', 'central_valley.png'),
    ('Champagne', 'FR', 'champagne.png'),
    ('Coquimbo', 'CL', 'coquimbo.png'),
    ('Cuyo', 'AR', 'cuyo.png'),
    ('Franken', 'DE', 'franken.png'),
    ('Idaho', 'US', 'idaho.png'),
    ('Languedoc-Roussillon', 'FR', 'languedoc_roussillon.png'),
    ('Lombardy', 'IT', 'lombardy.png'),
    ('Madeira', 'PT', 'madeira.png'),
    ('Mendoza', 'AR', 'mendoza.png'),
    ('Minho', 'PT', 'minho.png'),
    ('Mosel', 'DE', 'mosel.png'),
    ('Nahe', 'DE', 'nahe.png'),
    ('New South Wales', 'AU', 'new_south_wales.png'),
    ('New York', 'US', 'new_york.png'),
    ('Oregon', 'US', 'oregon.png'),
    ('Patagonia', 'AR', 'patagonia.png'),
    ('Pfalz', 'DE', 'pfalz.png'),
    ('Piedmont', 'IT', 'piedmont.png'),
    ('Provence', 'FR', 'provence.png'),
    ('Rheingau', 'DE', 'rheingau.png'),
    ('Rheinhessen', 'DE', 'rheinhessen.png'),
    ('Salta', 'AR', 'salta.png'),
    ('Sicily', 'IT', 'sicily.png'),
    ('South Australia', 'AU', 'south_australia.png'),
    ('Sud-Ouest', 'FR', 'sud_ouest.png'),
    ('Texas', 'US', 'texas.png'),
    ('Tuscany', 'IT', 'tuscany.png'),
    ('Vallée du Loire', 'FR', 'vallee_du_loire.png'),
    ('Vallée du Rhône', 'FR', 'vallee_du_rhone.png'),
    ('Veneto', 'IT', 'veneto.png'),
    ('Verona', 'IT', 'verona.png'),
    ('Victoria', 'AU', 'victoria.png'),
    ('Virginia', 'US', 'virginia.png'),
    ('Washington', 'US', 'washington.png'),
    ('Western Australia', 'AU', 'western_australia.png')
) AS v(region, country_code, region_logo)
WHERE d.region = v.region
  AND d.country_code = v.country_code
  AND d.region_logo = v.region_logo
SQL);
    }
}
