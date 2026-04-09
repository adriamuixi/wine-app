<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260409173000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Populate designation_of_origin.do_logo for validated non-Spanish DO logo assets';
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
    ('Cafayate', 'AR', 'cafayate_DO.jpeg'),
    ('Luján de Cuyo', 'AR', 'lujan_de_cuyo_DO.png'),
    ('Maipú', 'AR', 'maipu_DO.jpeg'),
    ('Mendoza', 'AR', 'mendoza_DO.jpeg'),
    ('Neuquén', 'AR', 'neuquen_DO.png'),
    ('San Juan', 'AR', 'san_juan_DO.jpeg'),
    ('Valle de Uco', 'AR', 'valle_de_uco_DO.jpg'),
    ('Adelaide Hills', 'AU', 'adelaide_hills_DO.png'),
    ('Barossa Valley', 'AU', 'barossa_valley_DO.png'),
    ('Clare Valley', 'AU', 'clare_valley_DO.png'),
    ('Coonawarra', 'AU', 'coonawarra_DO.png'),
    ('Hunter Valley', 'AU', 'hunter_valley_DO.png'),
    ('Margaret River', 'AU', 'margaret_river_DO.png'),
    ('McLaren Vale', 'AU', 'mclaren_vale_DO.png'),
    ('Yarra Valley', 'AU', 'yarra_valley_DO.png'),
    ('Baden', 'DE', 'baden_DO.jpeg'),
    ('Franken', 'DE', 'franken_DO.png'),
    ('Mosel', 'DE', 'mosel_DO.jpg'),
    ('Nahe', 'DE', 'nahe_DO.png'),
    ('Pfalz', 'DE', 'pfalz_DO.png'),
    ('Rheingau', 'DE', 'rheingau_DO.jpg'),
    ('Rheinhessen', 'DE', 'rheinhessen_DO.jpg'),
    ('Bandol', 'FR', 'bandol_DO.png'),
    ('Cahors', 'FR', 'cahors_DO.png'),
    ('Chablis', 'FR', 'chablis_DO.jpeg'),
    ('Champagne', 'FR', 'champagne_DO.jpg'),
    ('Chinon', 'FR', 'chinon_DO.jpg'),
    ('Châteauneuf-du-Pape', 'FR', 'chateauneuf_du_pape_DO.jpg'),
    ('Corbières', 'FR', 'corbieres_DO.jpg'),
    ('Côte-Rôtie', 'FR', 'cote_rotie_DO.png'),
    ('Côtes de Provence', 'FR', 'cotes_de_provence_DO.png'),
    ('Fleurie', 'FR', 'fleurie_DO.jpg'),
    ('Gevrey-Chambertin', 'FR', 'gevrey_chambertin_DO.jpg'),
    ('Gigondas', 'FR', 'gigondas_DO.png'),
    ('Hermitage', 'FR', 'hermitage_DO.png'),
    ('Margaux', 'FR', 'margaux_DO.jpg'),
    ('Meursault', 'FR', 'meursault_DO.png'),
    ('Minervois', 'FR', 'minervois_DO.png'),
    ('Morgon', 'FR', 'morgon_DO.jpg'),
    ('Pauillac', 'FR', 'pauillac_DO.jpg'),
    ('Pomerol', 'FR', 'pomerol_DO.jpeg'),
    ('Pouilly-Fumé', 'FR', 'pouilly_fume_DO.png'),
    ('Puligny-Montrachet', 'FR', 'puligny_montrachet_DO.png'),
    ('Saint-Émilion', 'FR', 'saint_emilion_DO.png'),
    ('Sancerre', 'FR', 'sancerre_DO.jpg'),
    ('Sauternes', 'FR', 'sauternes_DO.jpg'),
    ('Amarone della Valpolicella', 'IT', 'amarone_della_valpolicella_DO.jpg'),
    ('Barbaresco', 'IT', 'barbaresco_DO.png'),
    ('Barolo', 'IT', 'barolo_DO.jpg'),
    ('Bolgheri', 'IT', 'bolgheri_DO.jpeg'),
    ('Brunello di Montalcino', 'IT', 'brunello_di_montalcino_DO.png'),
    ('Chianti Classico', 'IT', 'chianti_classico_DO.jpeg'),
    ('Etna', 'IT', 'etna_DO.jpg'),
    ('Franciacorta', 'IT', 'franciacorta_DO.png'),
    ('Soave', 'IT', 'soave_DO.png'),
    ('Taurasi', 'IT', 'taurasi_DO.jpeg'),
    ('Toscana IGT', 'IT', 'toscana_igt_DO.jpg'),
    ('Véneto', 'IT', 'veneto_DO.png'),
    ('Alentejo', 'PT', 'alentejo_DO.jpeg'),
    ('Dão', 'PT', 'dao_DO.jpg'),
    ('Madeira', 'PT', 'madeira_DO.png'),
    ('Vinho Verde', 'PT', 'vinho_verde_DO.png'),
    ('Constantia', 'ZA', 'constantia_DO.png'),
    ('Elgin', 'ZA', 'elgin_DO.jpeg'),
    ('Franschhoek', 'ZA', 'franschhoek_DO.png'),
    ('Paarl', 'ZA', 'paarl_DO.jpg'),
    ('Stellenbosch', 'ZA', 'stellenbosch_DO.png'),
    ('Swartland', 'ZA', 'swartland_DO.png'),
    ('Walker Bay', 'ZA', 'walker_bay_DO.png'),
    ('Columbia Valley', 'US', 'columbia_valley_DO.png'),
    ('Dundee Hills', 'US', 'dundee_hills_DO.jpg'),
    ('Finger Lakes', 'US', 'finger_lakes_DO.png'),
    ('Horse Heaven Hills', 'US', 'horse_heaven_hills_DO.png'),
    ('Monticello', 'US', 'monticello_DO.jpg'),
    ('Napa Valley', 'US', 'napa_valley_DO.jpg'),
    ('Oakville', 'US', 'oakville_DO.png'),
    ('Paso Robles', 'US', 'paso_robles_DO.jpg'),
    ('Red Mountain', 'US', 'red_mountain_DO.png'),
    ('Russian River Valley', 'US', 'russian_river_valley_DO.png'),
    ('Rutherford', 'US', 'rutherford_DO.png'),
    ('Santa Cruz Mountains', 'US', 'santa_cruz_mountains_DO.png'),
    ('Santa Lucia Highlands', 'US', 'santa_lucia_highlands_DO.jpeg'),
    ('Sta. Rita Hills', 'US', 'sta_rita_hills_DO.png'),
    ('Stags Leap District', 'US', 'stags_leap_district_DO.png'),
    ('Texas Hill Country', 'US', 'texas_hill_country_DO.png'),
    ('Walla Walla Valley', 'US', 'walla_walla_valley_DO.png'),
    ('Willamette Valley', 'US', 'willamette_valley_DO.jpeg')
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
    ('Cafayate', 'AR', 'cafayate_DO.jpeg'),
    ('Luján de Cuyo', 'AR', 'lujan_de_cuyo_DO.png'),
    ('Maipú', 'AR', 'maipu_DO.jpeg'),
    ('Mendoza', 'AR', 'mendoza_DO.jpeg'),
    ('Neuquén', 'AR', 'neuquen_DO.png'),
    ('San Juan', 'AR', 'san_juan_DO.jpeg'),
    ('Valle de Uco', 'AR', 'valle_de_uco_DO.jpg'),
    ('Adelaide Hills', 'AU', 'adelaide_hills_DO.png'),
    ('Barossa Valley', 'AU', 'barossa_valley_DO.png'),
    ('Clare Valley', 'AU', 'clare_valley_DO.png'),
    ('Coonawarra', 'AU', 'coonawarra_DO.png'),
    ('Hunter Valley', 'AU', 'hunter_valley_DO.png'),
    ('Margaret River', 'AU', 'margaret_river_DO.png'),
    ('McLaren Vale', 'AU', 'mclaren_vale_DO.png'),
    ('Yarra Valley', 'AU', 'yarra_valley_DO.png'),
    ('Baden', 'DE', 'baden_DO.jpeg'),
    ('Franken', 'DE', 'franken_DO.png'),
    ('Mosel', 'DE', 'mosel_DO.jpg'),
    ('Nahe', 'DE', 'nahe_DO.png'),
    ('Pfalz', 'DE', 'pfalz_DO.png'),
    ('Rheingau', 'DE', 'rheingau_DO.jpg'),
    ('Rheinhessen', 'DE', 'rheinhessen_DO.jpg'),
    ('Bandol', 'FR', 'bandol_DO.png'),
    ('Cahors', 'FR', 'cahors_DO.png'),
    ('Chablis', 'FR', 'chablis_DO.jpeg'),
    ('Champagne', 'FR', 'champagne_DO.jpg'),
    ('Chinon', 'FR', 'chinon_DO.jpg'),
    ('Châteauneuf-du-Pape', 'FR', 'chateauneuf_du_pape_DO.jpg'),
    ('Corbières', 'FR', 'corbieres_DO.jpg'),
    ('Côte-Rôtie', 'FR', 'cote_rotie_DO.png'),
    ('Côtes de Provence', 'FR', 'cotes_de_provence_DO.png'),
    ('Fleurie', 'FR', 'fleurie_DO.jpg'),
    ('Gevrey-Chambertin', 'FR', 'gevrey_chambertin_DO.jpg'),
    ('Gigondas', 'FR', 'gigondas_DO.png'),
    ('Hermitage', 'FR', 'hermitage_DO.png'),
    ('Margaux', 'FR', 'margaux_DO.jpg'),
    ('Meursault', 'FR', 'meursault_DO.png'),
    ('Minervois', 'FR', 'minervois_DO.png'),
    ('Morgon', 'FR', 'morgon_DO.jpg'),
    ('Pauillac', 'FR', 'pauillac_DO.jpg'),
    ('Pomerol', 'FR', 'pomerol_DO.jpeg'),
    ('Pouilly-Fumé', 'FR', 'pouilly_fume_DO.png'),
    ('Puligny-Montrachet', 'FR', 'puligny_montrachet_DO.png'),
    ('Saint-Émilion', 'FR', 'saint_emilion_DO.png'),
    ('Sancerre', 'FR', 'sancerre_DO.jpg'),
    ('Sauternes', 'FR', 'sauternes_DO.jpg'),
    ('Amarone della Valpolicella', 'IT', 'amarone_della_valpolicella_DO.jpg'),
    ('Barbaresco', 'IT', 'barbaresco_DO.png'),
    ('Barolo', 'IT', 'barolo_DO.jpg'),
    ('Bolgheri', 'IT', 'bolgheri_DO.jpeg'),
    ('Brunello di Montalcino', 'IT', 'brunello_di_montalcino_DO.png'),
    ('Chianti Classico', 'IT', 'chianti_classico_DO.jpeg'),
    ('Etna', 'IT', 'etna_DO.jpg'),
    ('Franciacorta', 'IT', 'franciacorta_DO.png'),
    ('Soave', 'IT', 'soave_DO.png'),
    ('Taurasi', 'IT', 'taurasi_DO.jpeg'),
    ('Toscana IGT', 'IT', 'toscana_igt_DO.jpg'),
    ('Véneto', 'IT', 'veneto_DO.png'),
    ('Alentejo', 'PT', 'alentejo_DO.jpeg'),
    ('Dão', 'PT', 'dao_DO.jpg'),
    ('Madeira', 'PT', 'madeira_DO.png'),
    ('Vinho Verde', 'PT', 'vinho_verde_DO.png'),
    ('Constantia', 'ZA', 'constantia_DO.png'),
    ('Elgin', 'ZA', 'elgin_DO.jpeg'),
    ('Franschhoek', 'ZA', 'franschhoek_DO.png'),
    ('Paarl', 'ZA', 'paarl_DO.jpg'),
    ('Stellenbosch', 'ZA', 'stellenbosch_DO.png'),
    ('Swartland', 'ZA', 'swartland_DO.png'),
    ('Walker Bay', 'ZA', 'walker_bay_DO.png'),
    ('Columbia Valley', 'US', 'columbia_valley_DO.png'),
    ('Dundee Hills', 'US', 'dundee_hills_DO.jpg'),
    ('Finger Lakes', 'US', 'finger_lakes_DO.png'),
    ('Horse Heaven Hills', 'US', 'horse_heaven_hills_DO.png'),
    ('Monticello', 'US', 'monticello_DO.jpg'),
    ('Napa Valley', 'US', 'napa_valley_DO.jpg'),
    ('Oakville', 'US', 'oakville_DO.png'),
    ('Paso Robles', 'US', 'paso_robles_DO.jpg'),
    ('Red Mountain', 'US', 'red_mountain_DO.png'),
    ('Russian River Valley', 'US', 'russian_river_valley_DO.png'),
    ('Rutherford', 'US', 'rutherford_DO.png'),
    ('Santa Cruz Mountains', 'US', 'santa_cruz_mountains_DO.png'),
    ('Santa Lucia Highlands', 'US', 'santa_lucia_highlands_DO.jpeg'),
    ('Sta. Rita Hills', 'US', 'sta_rita_hills_DO.png'),
    ('Stags Leap District', 'US', 'stags_leap_district_DO.png'),
    ('Texas Hill Country', 'US', 'texas_hill_country_DO.png'),
    ('Walla Walla Valley', 'US', 'walla_walla_valley_DO.png'),
    ('Willamette Valley', 'US', 'willamette_valley_DO.jpeg')
) AS v(name, country_code, do_logo)
WHERE d.name = v.name
  AND d.country_code = v.country_code
  AND d.do_logo = v.do_logo
SQL);
    }
}
