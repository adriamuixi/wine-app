<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260407194500 extends AbstractMigration
{
    private const BATCH_TIMESTAMP = '2026-04-07T19:45:00+00:00';

    public function getDescription(): string
    {
        return 'Insert 47 wines and their purchases from the validated CSV batch.';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
WITH place_seed(place_type, name, address, city, country, map_data) AS (
    VALUES
        ('restaurant', 'Glenmoriston Town House Hotel', '21 Ness Bank,  IV2 4SF,', 'Inverness', 'united_kingdom', '{"lat": 57.472778, "lng": -4.227299}'),
        ('restaurant', 'Xavier Pellicer', 'Carrer de Provença, 310, Eixample, 08037 Barcelona', 'Barcelona', 'spain', '{"lat": 41.396049, "lng": 2.163401}'),
        ('restaurant', 'Taberner Amador', 'C. Extensión Agraria, 2, 50794 Nonaspe, Zaragoza', 'Nonaspe', 'spain', '{"lat": 41.209674, "lng": 0.250899}'),
        ('restaurant', 'Capri', 'Manuel Ibañez, S/N, 33590 Colombres, Asturias', 'Colombres', 'spain', '{"lat": 43.383012, "lng": -4.556988}'),
        ('restaurant', 'Casa Amparo', 'C. Arco de los Zapatos, 4, 33001 Oviedo, Asturias', 'Oviedo', 'spain', '{"lat": 43.359954, "lng": -5.846538}'),
        ('supermarket', 'Dia', 'C. Darío de Regoyos, 7-9, 33560 Ribadesella, Asturias', 'Ribadesella', 'spain', '{"lat": 43.463672, "lng": -5.065223}'),
        ('restaurant', 'Bar Galan', 'C/ de Muntaner, 212, Eixample, 08036 Barcelona', 'Barcelona', 'spain', '{"lat": 41.393551, "lng": 2.150455}'),
        ('restaurant', 'Hostal Satuna', 'Passeig de l''Àncora, 14, 17255 Sa Tuna, Girona', 'Begur', 'spain', '{"lat": 41.960147, "lng": 3.229621}'),
        ('supermarket', 'Jespac', 'C/ de Muntaner, 187, Eixample, 08036 Barcelona', 'Barcelona', 'spain', '{"lat": 41.392733, "lng": 2.15119}'),
        ('restaurant', 'Vi Negre', 'Carrer de les Guilleries, 17, local 3, Gràcia, 08012 Barcelona', 'Barcelona', 'spain', '{"lat": 41.403353, "lng": 2.156569}'),
        ('restaurant', 'Restaurant Setze', 'Carrer de Galileu, 316, Les Corts, 08028 Barcelona', 'Barcelona', 'spain', '{"lat": 41.385565, "lng": 2.131631}'),
        ('restaurant', 'Restaurant Les Cols', 'Carretera de la Canya, 106, 17800 Olot, Girona', 'Olot', 'spain', '{"lat": 42.194169, "lng": 2.500077}'),
        ('supermarket', 'La corona de l’ainsa', 'Pl. Mayor, 25, 22330 Aínsa, Huesca', 'Ainsa', 'spain', '{"lat": 42.417414, "lng": 0.138506}'),
        ('restaurant', 'La Gambarrada', 'Pg. del Carme, 22, 08800 Vilanova i la Geltrú, Barcelona', 'Vilanova I la Geltru', 'spain', '{"lat": 41.215263, "lng": 1.726916}'),
        ('restaurant', 'Casa Ruben', 'Avda. Bielsa km 63, 22364 Hospital, Huesca', 'Hospital', 'spain', '{"lat": 41.367911, "lng": 2.096615}'),
        ('restaurant', 'La Palmera', 'Carrer d''Enric Granados, 57, Eixample, 08008 Barcelona', 'Barcelona', 'spain', '{"lat": 41.39088, "lng": 2.158104}'),
        ('restaurant', 'Art I Tapes', 'Carrer de Mallorca, 450, Eixample, 08013 Barcelona', 'Barcelona', 'spain', '{"lat": 41.405011, "lng": 2.177616}'),
        ('restaurant', 'Bar Noe', 'Carrer de Villarroel, 227, Eixample, 08036 Barcelona', 'Barcelona', 'spain', '{"lat": 41.390837, "lng": 2.149026}'),
        ('restaurant', 'Hofmann', 'Carrer de la Granada del Penedès, 14-16, Sarrià-Sant Gervasi, 08006 Barcelona', 'Barcelona', 'spain', '{"lat": 41.397094, "lng": 2.152943}'),
        ('supermarket', 'Aldi', 'Av. de Sarrià, 12, Eixample, 08029 Barcelona', 'Barcelona', 'spain', '{"lat": 41.3903, "lng": 2.145931}'),
        ('restaurant', 'Pla de la Garsa', 'Carrer dels Assaonadors, 13, Ciutat Vella, 08003 Barcelona', 'Barcelona', 'spain', '{"lat": 41.386012, "lng": 2.180593}'),
        ('restaurant', 'Bar Cugat', 'Carrer del Bruc, 99, Eixample, 08009 Barcelona', 'Barcelona', 'spain', '{"lat": 41.395834, "lng": 2.167547}'),
        ('restaurant', 'Vi I Tófona', 'Av. Princep D''Asturies, 56, Gràcia, 08012 Barcelona', 'Barcelona', 'spain', '{"lat": 41.405271, "lng": 2.150241}'),
        ('supermarket', 'Mercadona', 'Carr. de Collblanc, 90, Les Corts, 08028 Barcelona', 'Barcelona', 'spain', '{"lat": 41.375916, "lng": 2.115666}'),
        ('restaurant', 'Taberna La parra', 'Carrer de Joanot Martorell, 3, Sants-Montjuïc, 08014 Barcelona', 'Barcelona', 'spain', '{"lat": 41.374979, "lng": 2.141001}'),
        ('restaurant', 'Cal Ramon', 'Plaça de Sant Joan, 13, 08720 Vilafranca del Penedès, Barcelona', 'Vilafranca del Penedes', 'spain', '{"lat": 41.346141, "lng": 1.698477}'),
        ('supermarket', 'Vinalium Collblanc', 'Carrer Francesc Layret, 18, 08903 L''Hospitalet de Llobregat, Barcelona', 'Barcelona', 'spain', '{"lat": 41.376442, "lng": 2.12003}'),
        ('restaurant', 'Un mondo divino', 'Salizada S. Canzian, 5984/a, 30121 Venezia VE, Italia', 'Venecia', 'italy', '{"lat": 45.437191, "lng": 12.33459}'),
        ('restaurant', 'Devil’s forest pub', 'Calle dei Stagneri o de la Fava, 5185, 30124 Venezia VE, Italia', 'Venecia', 'italy', '{"lat": 45.437191, "lng": 12.33459}'),
        ('restaurant', 'Trattoria Pallottino', 'Via Isola delle Stinche, 1r, 50122 Firenze FI, Italia', 'Florencia', 'italy', '{"lat": 43.769844, "lng": 11.260006}')
)
INSERT INTO place (place_type, name, address, city, country, map_data)
SELECT ps.place_type::place_type,
       ps.name,
       NULLIF(ps.address, ''),
       NULLIF(ps.city, ''),
       ps.country::place_country,
       CAST(ps.map_data AS JSONB)
FROM place_seed ps
WHERE NOT EXISTS (
    SELECT 1
    FROM place p
    WHERE p.place_type = ps.place_type::place_type
      AND p.name = ps.name
      AND COALESCE(p.address, '') = ps.address
      AND COALESCE(p.city, '') = ps.city
      AND p.country = ps.country::place_country
      AND p.map_data = CAST(ps.map_data AS JSONB)
)
SQL);

        $this->addSql(<<<'SQL'
WITH wine_seed(name, winery, wine_type, do_name, country, aging_type, vintage_year, alcohol_percentage) AS (
    VALUES
        ('Don Silvestre', 'Viña Ochagavía', 'red', 'Valle del Maipo', 'chile', 'young', 2024, 13.8),
        ('A maru', 'A maru de Gasconne', 'red', 'La Mancha', 'spain', 'crianza', 2021, 14),
        ('Entredosaguas', 'Taberner Amado', 'white', 'Bajo Aragon', 'spain', 'young', 2022, 14),
        ('Come Pulpo y Bebe Vino', 'Bienvenido', 'white', 'Rías Baixas', 'spain', 'young', 2022, 12.5),
        ('Blanco Nieva', 'Martúe', 'white', 'Rueda', 'spain', 'young', 2023, 13),
        ('Perro Ladrador', 'Finca Élez', 'red', 'Pago Finca Élez', 'spain', 'young', 2023, 13.4),
        ('El Vigía del Mar', 'Bodega Cuatro Rayas', 'white', 'Rueda', 'spain', 'young', 2024, 12.5),
        ('Mar Endins', 'Celler Oliveda', 'white', 'Empordà', 'spain', 'young', 2024, 12.5),
        ('La Nit de les Garnatxes - Llicorella', 'Celler de Capçanes', 'red', 'Montsant', 'spain', 'young', 2023, 14),
        ('La Sastrería', 'Anecoop Bodegas', 'red', 'Cariñena', 'spain', 'young', 2022, 14),
        ('Maragda Blanc', 'Mas Llunes', 'white', 'Empordà', 'spain', 'young', 2023, 13.5),
        ('Clos d''Agon', 'Clos d''Agon', 'red', 'Cataluña', 'spain', 'reserve', 2019, 14),
        ('Singular Parraleta', 'Bodegas Sers', 'red', 'Somontano', 'spain', 'young', 2022, 12.5),
        ('Vispius Tinto', 'Estrada Palacio', 'red', 'Somontano', 'spain', 'young', 2021, 12.5),
        ('Anais Negre', 'U MES U', 'red', 'Penedès', 'spain', 'young', 2022, 13.5),
        ('Sed Tinto', 'Fernando Mir Casaus', 'red', 'Somontano', 'spain', 'young', 2023, 15),
        ('Les Cousins - L''Inconscient', 'Les Cousins Marc & Adrià', 'red', 'Priorat', 'spain', 'young', 2022, 14),
        ('Capdevila Pujol Blanc', 'Blancher', 'white', 'Penedès', 'spain', 'young', 2023, 12),
        ('Y lo otro también', 'García & Valencia / Ylot', 'red', 'Montsant', 'spain', 'young', 2021, 13.5),
        ('El Pispa', 'Vinos del Paseante / Coca i Fitó', 'red', 'Montsant', 'spain', 'young', 2019, 14),
        ('Señorío de Gayan', 'Señorío de Gayan', 'red', 'Cariñena', 'spain', 'grand_reserve', 2016, 13),
        ('Universal Biodinámico Ecológico', 'Finca Constancia / Universal', 'red', 'La Mancha', 'spain', 'young', 2021, 14),
        ('Fenomenal', 'Fenomenal', 'white', 'Rueda', 'spain', 'young', 2017, 12.5),
        ('Ultreia Saint Jacques', 'Raúl Pérez', 'red', 'Bierzo', 'spain', 'young', 2016, 13.5),
        ('Rebeldes', '7 Magnífics / Torres', 'red', 'Montsant', 'spain', 'young', 2018, 14.5),
        ('Les Crestes', 'Mas Doix', 'red', 'Priorat', 'spain', 'young', 2017, 14.5),
        ('Pago de los Capellanes', 'Pago de los Capellanes', 'red', 'Ribera del Duero', 'spain', 'crianza', 2016, 15),
        ('Cap de Pera', 'Vallformosa', 'red', 'Terra Alta', 'spain', 'young', 2018, 14),
        ('Compta Ovelles', 'Ferré i Catasús', 'red', 'Penedès', 'spain', 'young', 2021, 13),
        ('Seré', 'Celler Vendrell Rived', 'red', 'Montsant', 'spain', 'young', 2018, 14),
        ('ssssshhhhhh...', 'Vins del Silenci / Ulldemolins', 'red', 'Montsant', 'spain', 'young', 2020, 14.5),
        ('Clot Blanc de Negres', 'Agrícola Sant Josep Bot', 'white', 'Cataluña', 'spain', 'young', 2017, 13.5),
        ('Condado de Haza', 'Condado de Haza / Familia Fernández Rivera', 'red', 'Ribera del Duero', 'spain', 'crianza', 2018, 14.5),
        ('Bach Extrísima', 'Masia Bach', 'white', 'Cataluña', 'spain', 'young', 2020, 12),
        ('MontRubí Black', 'MontRubí', 'red', 'Penedès', 'spain', 'young', 2019, 14),
        ('Le Volpare Soave', 'Tommasi Viticoltori', 'white', 'Soave', 'italy', 'young', 2020, 12),
        ('Devil''s Forest Pub House Wine', 'Devil''s Forest Pub', 'red', 'Véneto', 'italy', 'young', 2020, 13.5),
        ('Dogajolo Toscano', 'Carpineto', 'red', 'Toscana IGT', 'italy', 'young', 2018, 13.5),
        ('Flor d''Englora', 'Baronia del Montsant', 'red', 'Montsant', 'spain', 'young', 2021, 13.5),
        ('Masia Freyé', 'Domènech.Vidal / Vallformosa', 'red', 'Penedès', 'spain', 'young', 2018, 14),
        ('Bella Negre', 'Celler Mas Bella', 'red', 'Tarragona', 'spain', 'crianza', 2017, 13.5),
        ('Be Negre', 'Celler Ronadelles / Cap de Ruc', 'red', 'Montsant', 'spain', 'young', 2020, 13.5),
        ('Viña Carpio', 'Viña Carpio', 'red', 'Ribera del Duero', 'spain', 'reserve', 2017, 14),
        ('Petit Sió Negre', 'Costers del Sió', 'red', 'Costers del Segre', 'spain', 'young', 2021, 13.5),
        ('La Boscana', 'Costers del Sió', 'red', 'Costers del Segre', 'spain', 'young', 2022, 13.5),
        ('Mas Uberni Blanc de Blancs', 'Ros Marina Viticultors', 'white', 'Penedès', 'spain', 'young', 2020, 12),
        ('409 2020', 'Pagos del Rey', 'red', 'Ribera del Duero', 'spain', 'crianza', 2020, 14)
)
INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage, created_at, updated_at)
SELECT ws.name,
       ws.winery,
       ws.wine_type::wine_type,
       d.id,
       ws.country::country,
       ws.aging_type::aging_type,
       ws.vintage_year,
       ws.alcohol_percentage::numeric,
       '2026-04-07T19:45:00+00:00'::timestamptz,
       '2026-04-07T19:45:00+00:00'::timestamptz
FROM wine_seed ws
INNER JOIN designation_of_origin d ON d.name = ws.do_name
WHERE NOT EXISTS (
    SELECT 1
    FROM wine w
    WHERE w.name = ws.name
      AND COALESCE(w.winery, '') = ws.winery
      AND w.wine_type = ws.wine_type::wine_type
      AND w.do_id = d.id
      AND w.country = ws.country::country
      AND w.aging_type = ws.aging_type::aging_type
      AND w.vintage_year = ws.vintage_year
      AND w.alcohol_percentage = ws.alcohol_percentage::numeric
)
SQL);

        $this->addSql(<<<'SQL'
WITH grape_seed(name, winery, wine_type, do_name, country, aging_type, vintage_year, alcohol_percentage, grape_name, percentage, sort_order) AS (
    VALUES
        ('Don Silvestre', 'Viña Ochagavía', 'red', 'Valle del Maipo', 'chile', 'young', 2024, 13.8, 'Cabernet Sauvignon', NULL, 1),
        ('A maru', 'A maru de Gasconne', 'red', 'La Mancha', 'spain', 'crianza', 2021, 14, 'Syrah', NULL, 1),
        ('Entredosaguas', 'Taberner Amado', 'white', 'Bajo Aragon', 'spain', 'young', 2022, 14, 'Garnacha', NULL, 1),
        ('Come Pulpo y Bebe Vino', 'Bienvenido', 'white', 'Rías Baixas', 'spain', 'young', 2022, 12.5, 'Albariño', NULL, 1),
        ('Blanco Nieva', 'Martúe', 'white', 'Rueda', 'spain', 'young', 2023, 13, 'Verdejo', NULL, 1),
        ('Perro Ladrador', 'Finca Élez', 'red', 'Pago Finca Élez', 'spain', 'young', 2023, 13.4, 'Syrah', NULL, 1),
        ('Perro Ladrador', 'Finca Élez', 'red', 'Pago Finca Élez', 'spain', 'young', 2023, 13.4, 'Tempranillo', NULL, 2),
        ('El Vigía del Mar', 'Bodega Cuatro Rayas', 'white', 'Rueda', 'spain', 'young', 2024, 12.5, 'Verdejo', NULL, 1),
        ('El Vigía del Mar', 'Bodega Cuatro Rayas', 'white', 'Rueda', 'spain', 'young', 2024, 12.5, 'Cabernet Sauvignon', NULL, 2),
        ('Mar Endins', 'Celler Oliveda', 'white', 'Empordà', 'spain', 'young', 2024, 12.5, 'Garnacha', NULL, 1),
        ('La Nit de les Garnatxes - Llicorella', 'Celler de Capçanes', 'red', 'Montsant', 'spain', 'young', 2023, 14, 'Garnacha', NULL, 1),
        ('La Sastrería', 'Anecoop Bodegas', 'red', 'Cariñena', 'spain', 'young', 2022, 14, 'Garnacha', NULL, 1),
        ('La Sastrería', 'Anecoop Bodegas', 'red', 'Cariñena', 'spain', 'young', 2022, 14, 'Carignan', NULL, 2),
        ('Maragda Blanc', 'Mas Llunes', 'white', 'Empordà', 'spain', 'young', 2023, 13.5, 'Garnacha', NULL, 1),
        ('Maragda Blanc', 'Mas Llunes', 'white', 'Empordà', 'spain', 'young', 2023, 13.5, 'Macabeo', NULL, 2),
        ('Clos d''Agon', 'Clos d''Agon', 'red', 'Cataluña', 'spain', 'reserve', 2019, 14, 'Cabernet Franc', NULL, 1),
        ('Clos d''Agon', 'Clos d''Agon', 'red', 'Cataluña', 'spain', 'reserve', 2019, 14, 'Syrah', NULL, 2),
        ('Clos d''Agon', 'Clos d''Agon', 'red', 'Cataluña', 'spain', 'reserve', 2019, 14, 'Petit Verdot', NULL, 3),
        ('Clos d''Agon', 'Clos d''Agon', 'red', 'Cataluña', 'spain', 'reserve', 2019, 14, 'Cabernet Sauvignon', NULL, 4),
        ('Clos d''Agon', 'Clos d''Agon', 'red', 'Cataluña', 'spain', 'reserve', 2019, 14, 'Merlot', NULL, 5),
        ('Singular Parraleta', 'Bodegas Sers', 'red', 'Somontano', 'spain', 'young', 2022, 12.5, 'Parraleta', NULL, 1),
        ('Vispius Tinto', 'Estrada Palacio', 'red', 'Somontano', 'spain', 'young', 2021, 12.5, 'Garnacha', NULL, 1),
        ('Vispius Tinto', 'Estrada Palacio', 'red', 'Somontano', 'spain', 'young', 2021, 12.5, 'Tempranillo', NULL, 2),
        ('Anais Negre', 'U MES U', 'red', 'Penedès', 'spain', 'young', 2022, 13.5, 'Tempranillo', NULL, 1),
        ('Anais Negre', 'U MES U', 'red', 'Penedès', 'spain', 'young', 2022, 13.5, 'Syrah', NULL, 2),
        ('Sed Tinto', 'Fernando Mir Casaus', 'red', 'Somontano', 'spain', 'young', 2023, 15, 'Garnacha', NULL, 1),
        ('Sed Tinto', 'Fernando Mir Casaus', 'red', 'Somontano', 'spain', 'young', 2023, 15, 'Mazuelo', NULL, 2),
        ('Sed Tinto', 'Fernando Mir Casaus', 'red', 'Somontano', 'spain', 'young', 2023, 15, 'Syrah', NULL, 3),
        ('Les Cousins - L''Inconscient', 'Les Cousins Marc & Adrià', 'red', 'Priorat', 'spain', 'young', 2022, 14, 'Carignan', NULL, 1),
        ('Les Cousins - L''Inconscient', 'Les Cousins Marc & Adrià', 'red', 'Priorat', 'spain', 'young', 2022, 14, 'Garnacha', NULL, 2),
        ('Les Cousins - L''Inconscient', 'Les Cousins Marc & Adrià', 'red', 'Priorat', 'spain', 'young', 2022, 14, 'Cabernet Sauvignon', NULL, 3),
        ('Les Cousins - L''Inconscient', 'Les Cousins Marc & Adrià', 'red', 'Priorat', 'spain', 'young', 2022, 14, 'Merlot', NULL, 4),
        ('Les Cousins - L''Inconscient', 'Les Cousins Marc & Adrià', 'red', 'Priorat', 'spain', 'young', 2022, 14, 'Syrah', NULL, 5),
        ('Capdevila Pujol Blanc', 'Blancher', 'white', 'Penedès', 'spain', 'young', 2023, 12, 'Xarel·lo', NULL, 1),
        ('Capdevila Pujol Blanc', 'Blancher', 'white', 'Penedès', 'spain', 'young', 2023, 12, 'Moscatel de Alejandría', NULL, 2),
        ('Y lo otro también', 'García & Valencia / Ylot', 'red', 'Montsant', 'spain', 'young', 2021, 13.5, 'Garnacha', NULL, 1),
        ('El Pispa', 'Vinos del Paseante / Coca i Fitó', 'red', 'Montsant', 'spain', 'young', 2019, 14, 'Garnacha', NULL, 1),
        ('El Pispa', 'Vinos del Paseante / Coca i Fitó', 'red', 'Montsant', 'spain', 'young', 2019, 14, 'Carignan', NULL, 2),
        ('Señorío de Gayan', 'Señorío de Gayan', 'red', 'Cariñena', 'spain', 'grand_reserve', 2016, 13, 'Tempranillo', NULL, 1),
        ('Universal Biodinámico Ecológico', 'Finca Constancia / Universal', 'red', 'La Mancha', 'spain', 'young', 2021, 14, 'Cabernet Sauvignon', NULL, 1),
        ('Fenomenal', 'Fenomenal', 'white', 'Rueda', 'spain', 'young', 2017, 12.5, 'Sauvignon Blanc', NULL, 1),
        ('Ultreia Saint Jacques', 'Raúl Pérez', 'red', 'Bierzo', 'spain', 'young', 2016, 13.5, 'Mencía', NULL, 1),
        ('Rebeldes', '7 Magnífics / Torres', 'red', 'Montsant', 'spain', 'young', 2018, 14.5, 'Carignan', NULL, 1),
        ('Rebeldes', '7 Magnífics / Torres', 'red', 'Montsant', 'spain', 'young', 2018, 14.5, 'Garnacha', NULL, 2),
        ('Rebeldes', '7 Magnífics / Torres', 'red', 'Montsant', 'spain', 'young', 2018, 14.5, 'Syrah', NULL, 3),
        ('Les Crestes', 'Mas Doix', 'red', 'Priorat', 'spain', 'young', 2017, 14.5, 'Garnacha', NULL, 1),
        ('Les Crestes', 'Mas Doix', 'red', 'Priorat', 'spain', 'young', 2017, 14.5, 'Carignan', NULL, 2),
        ('Les Crestes', 'Mas Doix', 'red', 'Priorat', 'spain', 'young', 2017, 14.5, 'Syrah', NULL, 3),
        ('Pago de los Capellanes', 'Pago de los Capellanes', 'red', 'Ribera del Duero', 'spain', 'crianza', 2016, 15, 'Tempranillo', NULL, 1),
        ('Cap de Pera', 'Vallformosa', 'red', 'Terra Alta', 'spain', 'young', 2018, 14, 'Garnacha', NULL, 1),
        ('Cap de Pera', 'Vallformosa', 'red', 'Terra Alta', 'spain', 'young', 2018, 14, 'Syrah', NULL, 2),
        ('Compta Ovelles', 'Ferré i Catasús', 'red', 'Penedès', 'spain', 'young', 2021, 13, 'Tempranillo', NULL, 1),
        ('Compta Ovelles', 'Ferré i Catasús', 'red', 'Penedès', 'spain', 'young', 2021, 13, 'Syrah', NULL, 2),
        ('Compta Ovelles', 'Ferré i Catasús', 'red', 'Penedès', 'spain', 'young', 2021, 13, 'Merlot', NULL, 3),
        ('Seré', 'Celler Vendrell Rived', 'red', 'Montsant', 'spain', 'young', 2018, 14, 'Garnacha', NULL, 1),
        ('Seré', 'Celler Vendrell Rived', 'red', 'Montsant', 'spain', 'young', 2018, 14, 'Carignan', NULL, 2),
        ('ssssshhhhhh...', 'Vins del Silenci / Ulldemolins', 'red', 'Montsant', 'spain', 'young', 2020, 14.5, 'Garnacha', NULL, 1),
        ('Clot Blanc de Negres', 'Agrícola Sant Josep Bot', 'white', 'Cataluña', 'spain', 'young', 2017, 13.5, 'Carignan', NULL, 1),
        ('Condado de Haza', 'Condado de Haza / Familia Fernández Rivera', 'red', 'Ribera del Duero', 'spain', 'crianza', 2018, 14.5, 'Tempranillo', NULL, 1),
        ('Bach Extrísima', 'Masia Bach', 'white', 'Cataluña', 'spain', 'young', 2020, 12, 'Xarel·lo', NULL, 1),
        ('Bach Extrísima', 'Masia Bach', 'white', 'Cataluña', 'spain', 'young', 2020, 12, 'Macabeo', NULL, 2),
        ('Bach Extrísima', 'Masia Bach', 'white', 'Cataluña', 'spain', 'young', 2020, 12, 'Chardonnay', NULL, 3),
        ('MontRubí Black', 'MontRubí', 'red', 'Penedès', 'spain', 'young', 2019, 14, 'Garnacha', NULL, 1),
        ('Le Volpare Soave', 'Tommasi Viticoltori', 'white', 'Soave', 'italy', 'young', 2020, 12, 'Garganega', NULL, 1),
        ('Le Volpare Soave', 'Tommasi Viticoltori', 'white', 'Soave', 'italy', 'young', 2020, 12, 'Trebbiano de Soave', NULL, 2),
        ('Devil''s Forest Pub House Wine', 'Devil''s Forest Pub', 'red', 'Véneto', 'italy', 'young', 2020, 13.5, 'Sangiovese', NULL, 1),
        ('Dogajolo Toscano', 'Carpineto', 'red', 'Toscana IGT', 'italy', 'young', 2018, 13.5, 'Sangiovese', NULL, 1),
        ('Dogajolo Toscano', 'Carpineto', 'red', 'Toscana IGT', 'italy', 'young', 2018, 13.5, 'Cabernet Sauvignon', NULL, 2),
        ('Flor d''Englora', 'Baronia del Montsant', 'red', 'Montsant', 'spain', 'young', 2021, 13.5, 'Garnacha', NULL, 1),
        ('Masia Freyé', 'Domènech.Vidal / Vallformosa', 'red', 'Penedès', 'spain', 'young', 2018, 14, 'Syrah', NULL, 1),
        ('Masia Freyé', 'Domènech.Vidal / Vallformosa', 'red', 'Penedès', 'spain', 'young', 2018, 14, 'Tempranillo', NULL, 2),
        ('Bella Negre', 'Celler Mas Bella', 'red', 'Tarragona', 'spain', 'crianza', 2017, 13.5, 'Tempranillo', NULL, 1),
        ('Be Negre', 'Celler Ronadelles / Cap de Ruc', 'red', 'Montsant', 'spain', 'young', 2020, 13.5, 'Garnacha', NULL, 1),
        ('Viña Carpio', 'Viña Carpio', 'red', 'Ribera del Duero', 'spain', 'reserve', 2017, 14, 'Tempranillo', NULL, 1),
        ('Petit Sió Negre', 'Costers del Sió', 'red', 'Costers del Segre', 'spain', 'young', 2021, 13.5, 'Tempranillo', NULL, 1),
        ('Petit Sió Negre', 'Costers del Sió', 'red', 'Costers del Segre', 'spain', 'young', 2021, 13.5, 'Garnacha', NULL, 2),
        ('Petit Sió Negre', 'Costers del Sió', 'red', 'Costers del Segre', 'spain', 'young', 2021, 13.5, 'Syrah', NULL, 3),
        ('La Boscana', 'Costers del Sió', 'red', 'Costers del Segre', 'spain', 'young', 2022, 13.5, 'Tempranillo', NULL, 1),
        ('La Boscana', 'Costers del Sió', 'red', 'Costers del Segre', 'spain', 'young', 2022, 13.5, 'Garnacha', NULL, 2),
        ('La Boscana', 'Costers del Sió', 'red', 'Costers del Segre', 'spain', 'young', 2022, 13.5, 'Syrah', NULL, 3),
        ('Mas Uberni Blanc de Blancs', 'Ros Marina Viticultors', 'white', 'Penedès', 'spain', 'young', 2020, 12, 'Xarel·lo', NULL, 1),
        ('Mas Uberni Blanc de Blancs', 'Ros Marina Viticultors', 'white', 'Penedès', 'spain', 'young', 2020, 12, 'Chardonnay', NULL, 2),
        ('409 2020', 'Pagos del Rey', 'red', 'Ribera del Duero', 'spain', 'crianza', 2020, 14, 'Tempranillo', NULL, 1)
)
INSERT INTO wine_grape (wine_id, grape_id, percentage)
SELECT w.id,
       g.id,
       gs.percentage::numeric
FROM grape_seed gs
INNER JOIN designation_of_origin d ON d.name = gs.do_name
INNER JOIN wine w
    ON w.name = gs.name
   AND COALESCE(w.winery, '') = gs.winery
   AND w.wine_type = gs.wine_type::wine_type
   AND w.do_id = d.id
   AND w.country = gs.country::country
   AND w.aging_type = gs.aging_type::aging_type
   AND w.vintage_year = gs.vintage_year
   AND w.alcohol_percentage = gs.alcohol_percentage::numeric
INNER JOIN grape g ON g.name = gs.grape_name
WHERE NOT EXISTS (
    SELECT 1
    FROM wine_grape wg
    WHERE wg.wine_id = w.id
      AND wg.grape_id = g.id
)
ORDER BY gs.name, gs.sort_order
SQL);

        $this->addSql(<<<'SQL'
WITH purchase_seed(
    wine_name,
    winery,
    wine_type,
    do_name,
    country,
    aging_type,
    vintage_year,
    alcohol_percentage,
    place_type,
    place_name,
    place_address,
    place_city,
    place_country,
    place_map_data,
    price_paid,
    purchased_at
) AS (
    VALUES
        ('Don Silvestre', 'Viña Ochagavía', 'red', 'Valle del Maipo', 'chile', 'young', 2024, 13.8, 'restaurant', 'Glenmoriston Town House Hotel', '21 Ness Bank,  IV2 4SF,', 'Inverness', 'united_kingdom', '{"lat": 57.472778, "lng": -4.227299}', 32.7, '2026-01-04T12:00:00+00:00'),
        ('A maru', 'A maru de Gasconne', 'red', 'La Mancha', 'spain', 'crianza', 2021, 14, 'restaurant', 'Xavier Pellicer', 'Carrer de Provença, 310, Eixample, 08037 Barcelona', 'Barcelona', 'spain', '{"lat": 41.396049, "lng": 2.163401}', 34.75, '2026-01-23T12:00:00+00:00'),
        ('Entredosaguas', 'Taberner Amado', 'white', 'Bajo Aragon', 'spain', 'young', 2022, 14, 'restaurant', 'Taberner Amador', 'C. Extensión Agraria, 2, 50794 Nonaspe, Zaragoza', 'Nonaspe', 'spain', '{"lat": 41.209674, "lng": 0.250899}', 12.4, '2025-10-31T12:00:00+00:00'),
        ('Come Pulpo y Bebe Vino', 'Bienvenido', 'white', 'Rías Baixas', 'spain', 'young', 2022, 12.5, 'restaurant', 'Capri', 'Manuel Ibañez, S/N, 33590 Colombres, Asturias', 'Colombres', 'spain', '{"lat": 43.383012, "lng": -4.556988}', 11.3, '2025-07-19T12:00:00+00:00'),
        ('Blanco Nieva', 'Martúe', 'white', 'Rueda', 'spain', 'young', 2023, 13, 'restaurant', 'Casa Amparo', 'C. Arco de los Zapatos, 4, 33001 Oviedo, Asturias', 'Oviedo', 'spain', '{"lat": 43.359954, "lng": -5.846538}', 14.85, '2025-07-18T12:00:00+00:00'),
        ('Perro Ladrador', 'Finca Élez', 'red', 'Pago Finca Élez', 'spain', 'young', 2023, 13.4, 'supermarket', 'Dia', 'C. Darío de Regoyos, 7-9, 33560 Ribadesella, Asturias', 'Ribadesella', 'spain', '{"lat": 43.463672, "lng": -5.065223}', 5.6, '2025-07-17T12:00:00+00:00'),
        ('El Vigía del Mar', 'Bodega Cuatro Rayas', 'white', 'Rueda', 'spain', 'young', 2024, 12.5, 'restaurant', 'Bar Galan', 'C/ de Muntaner, 212, Eixample, 08036 Barcelona', 'Barcelona', 'spain', '{"lat": 41.393551, "lng": 2.150455}', 13.8, '2025-07-11T12:00:00+00:00'),
        ('Mar Endins', 'Celler Oliveda', 'white', 'Empordà', 'spain', 'young', 2024, 12.5, 'restaurant', 'Hostal Satuna', 'Passeig de l''Àncora, 14, 17255 Sa Tuna, Girona', 'Begur', 'spain', '{"lat": 41.960147, "lng": 3.229621}', 17.9, '2025-07-05T12:00:00+00:00'),
        ('La Nit de les Garnatxes - Llicorella', 'Celler de Capçanes', 'red', 'Montsant', 'spain', 'young', 2023, 14, 'supermarket', 'Jespac', 'C/ de Muntaner, 187, Eixample, 08036 Barcelona', 'Barcelona', 'spain', '{"lat": 41.392733, "lng": 2.15119}', 6.85, '2025-06-13T12:00:00+00:00'),
        ('La Sastrería', 'Anecoop Bodegas', 'red', 'Cariñena', 'spain', 'young', 2022, 14, 'restaurant', 'Vi Negre', 'Carrer de les Guilleries, 17, local 3, Gràcia, 08012 Barcelona', 'Barcelona', 'spain', '{"lat": 41.403353, "lng": 2.156569}', 18.7, '2025-04-04T12:00:00+00:00'),
        ('Maragda Blanc', 'Mas Llunes', 'white', 'Empordà', 'spain', 'young', 2023, 13.5, 'restaurant', 'Restaurant Setze', 'Carrer de Galileu, 316, Les Corts, 08028 Barcelona', 'Barcelona', 'spain', '{"lat": 41.385565, "lng": 2.131631}', 21, '2025-03-07T12:00:00+00:00'),
        ('Clos d''Agon', 'Clos d''Agon', 'red', 'Cataluña', 'spain', 'reserve', 2019, 14, 'restaurant', 'Restaurant Les Cols', 'Carretera de la Canya, 106, 17800 Olot, Girona', 'Olot', 'spain', '{"lat": 42.194169, "lng": 2.500077}', 48, '2025-01-25T12:00:00+00:00'),
        ('Singular Parraleta', 'Bodegas Sers', 'red', 'Somontano', 'spain', 'young', 2022, 12.5, 'supermarket', 'La corona de l’ainsa', 'Pl. Mayor, 25, 22330 Aínsa, Huesca', 'Ainsa', 'spain', '{"lat": 42.417414, "lng": 0.138506}', 14.65, '2024-06-29T12:00:00+00:00'),
        ('Vispius Tinto', 'Estrada Palacio', 'red', 'Somontano', 'spain', 'young', 2021, 12.5, 'supermarket', 'La corona de l’ainsa', 'Pl. Mayor, 25, 22330 Aínsa, Huesca', 'Ainsa', 'spain', '{"lat": 42.417414, "lng": 0.138506}', 13.7, '2024-06-29T12:00:00+00:00'),
        ('Anais Negre', 'U MES U', 'red', 'Penedès', 'spain', 'young', 2022, 13.5, 'restaurant', 'La Gambarrada', 'Pg. del Carme, 22, 08800 Vilanova i la Geltrú, Barcelona', 'Vilanova I la Geltru', 'spain', '{"lat": 41.215263, "lng": 1.726916}', 19.35, '2024-08-17T12:00:00+00:00'),
        ('Sed Tinto', 'Fernando Mir Casaus', 'red', 'Somontano', 'spain', 'young', 2023, 15, 'restaurant', 'Casa Ruben', 'Avda. Bielsa km 63, 22364 Hospital, Huesca', 'Hospital', 'spain', '{"lat": 41.367911, "lng": 2.096615}', 24.8, '2024-06-29T12:00:00+00:00'),
        ('Les Cousins - L''Inconscient', 'Les Cousins Marc & Adrià', 'red', 'Priorat', 'spain', 'young', 2022, 14, 'restaurant', 'La Palmera', 'Carrer d''Enric Granados, 57, Eixample, 08008 Barcelona', 'Barcelona', 'spain', '{"lat": 41.39088, "lng": 2.158104}', 17.6, '2024-04-30T12:00:00+00:00'),
        ('Capdevila Pujol Blanc', 'Blancher', 'white', 'Penedès', 'spain', 'young', 2023, 12, 'restaurant', 'Art I Tapes', 'Carrer de Mallorca, 450, Eixample, 08013 Barcelona', 'Barcelona', 'spain', '{"lat": 41.405011, "lng": 2.177616}', 15.7, '2024-03-16T12:00:00+00:00'),
        ('Y lo otro también', 'García & Valencia / Ylot', 'red', 'Montsant', 'spain', 'young', 2021, 13.5, 'restaurant', 'Bar Noe', 'Carrer de Villarroel, 227, Eixample, 08036 Barcelona', 'Barcelona', 'spain', '{"lat": 41.390837, "lng": 2.149026}', 19.45, '2024-02-23T12:00:00+00:00'),
        ('El Pispa', 'Vinos del Paseante / Coca i Fitó', 'red', 'Montsant', 'spain', 'young', 2019, 14, 'restaurant', 'Hofmann', 'Carrer de la Granada del Penedès, 14-16, Sarrià-Sant Gervasi, 08006 Barcelona', 'Barcelona', 'spain', '{"lat": 41.397094, "lng": 2.152943}', 28, '2024-01-23T12:00:00+00:00'),
        ('Señorío de Gayan', 'Señorío de Gayan', 'red', 'Cariñena', 'spain', 'grand_reserve', 2016, 13, 'supermarket', 'Aldi', 'Av. de Sarrià, 12, Eixample, 08029 Barcelona', 'Barcelona', 'spain', '{"lat": 41.3903, "lng": 2.145931}', 7.9, '2023-09-22T12:00:00+00:00'),
        ('Universal Biodinámico Ecológico', 'Finca Constancia / Universal', 'red', 'La Mancha', 'spain', 'young', 2021, 14, 'supermarket', 'Aldi', 'Av. de Sarrià, 12, Eixample, 08029 Barcelona', 'Barcelona', 'spain', '{"lat": 41.3903, "lng": 2.145931}', 6.7, '2023-05-20T12:00:00+00:00'),
        ('Fenomenal', 'Fenomenal', 'white', 'Rueda', 'spain', 'young', 2017, 12.5, 'restaurant', 'Pla de la Garsa', 'Carrer dels Assaonadors, 13, Ciutat Vella, 08003 Barcelona', 'Barcelona', 'spain', '{"lat": 41.386012, "lng": 2.180593}', 16.25, '2023-03-18T12:00:00+00:00'),
        ('Ultreia Saint Jacques', 'Raúl Pérez', 'red', 'Bierzo', 'spain', 'young', 2016, 13.5, 'restaurant', 'Bar Cugat', 'Carrer del Bruc, 99, Eixample, 08009 Barcelona', 'Barcelona', 'spain', '{"lat": 41.395834, "lng": 2.167547}', 17.6, '2018-05-04T12:00:00+00:00'),
        ('Rebeldes', '7 Magnífics / Torres', 'red', 'Montsant', 'spain', 'young', 2018, 14.5, 'restaurant', 'Vi I Tófona', 'Av. Princep D''Asturies, 56, Gràcia, 08012 Barcelona', 'Barcelona', 'spain', '{"lat": 41.405271, "lng": 2.150241}', 16.7, '2019-06-28T12:00:00+00:00'),
        ('Les Crestes', 'Mas Doix', 'red', 'Priorat', 'spain', 'young', 2017, 14.5, 'restaurant', 'Pla de la Garsa', 'Carrer dels Assaonadors, 13, Ciutat Vella, 08003 Barcelona', 'Barcelona', 'spain', '{"lat": 41.386012, "lng": 2.180593}', 18.7, '2019-08-23T12:00:00+00:00'),
        ('Pago de los Capellanes', 'Pago de los Capellanes', 'red', 'Ribera del Duero', 'spain', 'crianza', 2016, 15, 'supermarket', 'Aldi', 'Av. de Sarrià, 12, Eixample, 08029 Barcelona', 'Barcelona', 'spain', '{"lat": 41.3903, "lng": 2.145931}', 26, '2019-12-29T12:00:00+00:00'),
        ('Cap de Pera', 'Vallformosa', 'red', 'Terra Alta', 'spain', 'young', 2018, 14, 'supermarket', 'Mercadona', 'Carr. de Collblanc, 90, Les Corts, 08028 Barcelona', 'Barcelona', 'spain', '{"lat": 41.375916, "lng": 2.115666}', 7.4, '2020-03-14T12:00:00+00:00'),
        ('Compta Ovelles', 'Ferré i Catasús', 'red', 'Penedès', 'spain', 'young', 2021, 13, 'supermarket', 'Jespac', 'C/ de Muntaner, 187, Eixample, 08036 Barcelona', 'Barcelona', 'spain', '{"lat": 41.392733, "lng": 2.15119}', 5.73, '2020-09-24T12:00:00+00:00'),
        ('Seré', 'Celler Vendrell Rived', 'red', 'Montsant', 'spain', 'young', 2018, 14, 'restaurant', 'Taberna La parra', 'Carrer de Joanot Martorell, 3, Sants-Montjuïc, 08014 Barcelona', 'Barcelona', 'spain', '{"lat": 41.374979, "lng": 2.141001}', 15.85, '2020-10-10T12:00:00+00:00'),
        ('ssssshhhhhh...', 'Vins del Silenci / Ulldemolins', 'red', 'Montsant', 'spain', 'young', 2020, 14.5, 'supermarket', 'Mercadona', 'Carr. de Collblanc, 90, Les Corts, 08028 Barcelona', 'Barcelona', 'spain', '{"lat": 41.375916, "lng": 2.115666}', 7.19, '2020-11-08T12:00:00+00:00'),
        ('Clot Blanc de Negres', 'Agrícola Sant Josep Bot', 'white', 'Cataluña', 'spain', 'young', 2017, 13.5, 'supermarket', 'Jespac', 'C/ de Muntaner, 187, Eixample, 08036 Barcelona', 'Barcelona', 'spain', '{"lat": 41.392733, "lng": 2.15119}', 5.8, '2020-11-20T12:00:00+00:00'),
        ('Condado de Haza', 'Condado de Haza / Familia Fernández Rivera', 'red', 'Ribera del Duero', 'spain', 'crianza', 2018, 14.5, 'supermarket', 'Aldi', 'Av. de Sarrià, 12, Eixample, 08029 Barcelona', 'Barcelona', 'spain', '{"lat": 41.3903, "lng": 2.145931}', 5.54, '2021-03-13T12:00:00+00:00'),
        ('Bach Extrísima', 'Masia Bach', 'white', 'Cataluña', 'spain', 'young', 2020, 12, 'restaurant', 'Cal Ramon', 'Plaça de Sant Joan, 13, 08720 Vilafranca del Penedès, Barcelona', 'Vilafranca del Penedes', 'spain', '{"lat": 41.346141, "lng": 1.698477}', 15.34, '2021-05-24T12:00:00+00:00'),
        ('MontRubí Black', 'MontRubí', 'red', 'Penedès', 'spain', 'young', 2019, 14, 'supermarket', 'Vinalium Collblanc', 'Carrer Francesc Layret, 18, 08903 L''Hospitalet de Llobregat, Barcelona', 'Barcelona', 'spain', '{"lat": 41.376442, "lng": 2.12003}', 11, '2021-07-10T12:00:00+00:00'),
        ('Le Volpare Soave', 'Tommasi Viticoltori', 'white', 'Soave', 'italy', 'young', 2020, 12, 'restaurant', 'Un mondo divino', 'Salizada S. Canzian, 5984/a, 30121 Venezia VE, Italia', 'Venecia', 'italy', '{"lat": 45.437191, "lng": 12.33459}', 17.63, '2021-08-02T12:00:00+00:00'),
        ('Devil''s Forest Pub House Wine', 'Devil''s Forest Pub', 'red', 'Véneto', 'italy', 'young', 2020, 13.5, 'restaurant', 'Devil’s forest pub', 'Calle dei Stagneri o de la Fava, 5185, 30124 Venezia VE, Italia', 'Venecia', 'italy', '{"lat": 45.437191, "lng": 12.33459}', 14.8, '2021-08-04T12:00:00+00:00'),
        ('Dogajolo Toscano', 'Carpineto', 'red', 'Toscana IGT', 'italy', 'young', 2018, 13.5, 'restaurant', 'Trattoria Pallottino', 'Via Isola delle Stinche, 1r, 50122 Firenze FI, Italia', 'Florencia', 'italy', '{"lat": 43.769844, "lng": 11.260006}', 19.42, '2021-08-05T12:00:00+00:00'),
        ('Flor d''Englora', 'Baronia del Montsant', 'red', 'Montsant', 'spain', 'young', 2021, 13.5, 'supermarket', 'Jespac', 'C/ de Muntaner, 187, Eixample, 08036 Barcelona', 'Barcelona', 'spain', '{"lat": 41.392733, "lng": 2.15119}', 7.8, '2021-08-14T12:00:00+00:00'),
        ('Masia Freyé', 'Domènech.Vidal / Vallformosa', 'red', 'Penedès', 'spain', 'young', 2018, 14, 'supermarket', 'Jespac', 'C/ de Muntaner, 187, Eixample, 08036 Barcelona', 'Barcelona', 'spain', '{"lat": 41.392733, "lng": 2.15119}', 6.3, '2021-08-14T12:00:00+00:00'),
        ('Bella Negre', 'Celler Mas Bella', 'red', 'Tarragona', 'spain', 'crianza', 2017, 13.5, 'supermarket', 'Aldi', 'Av. de Sarrià, 12, Eixample, 08029 Barcelona', 'Barcelona', 'spain', '{"lat": 41.3903, "lng": 2.145931}', 5.7, '2021-10-17T12:00:00+00:00'),
        ('Be Negre', 'Celler Ronadelles / Cap de Ruc', 'red', 'Montsant', 'spain', 'young', 2020, 13.5, 'supermarket', 'Jespac', 'C/ de Muntaner, 187, Eixample, 08036 Barcelona', 'Barcelona', 'spain', '{"lat": 41.392733, "lng": 2.15119}', 6.1, '2021-10-31T12:00:00+00:00'),
        ('Viña Carpio', 'Viña Carpio', 'red', 'Ribera del Duero', 'spain', 'reserve', 2017, 14, 'supermarket', 'Jespac', 'C/ de Muntaner, 187, Eixample, 08036 Barcelona', 'Barcelona', 'spain', '{"lat": 41.392733, "lng": 2.15119}', 5.4, '2022-09-12T12:00:00+00:00'),
        ('Petit Sió Negre', 'Costers del Sió', 'red', 'Costers del Segre', 'spain', 'young', 2021, 13.5, 'supermarket', 'Jespac', 'C/ de Muntaner, 187, Eixample, 08036 Barcelona', 'Barcelona', 'spain', '{"lat": 41.392733, "lng": 2.15119}', 7.2, '2022-01-02T12:00:00+00:00'),
        ('La Boscana', 'Costers del Sió', 'red', 'Costers del Segre', 'spain', 'young', 2022, 13.5, 'supermarket', 'Jespac', 'C/ de Muntaner, 187, Eixample, 08036 Barcelona', 'Barcelona', 'spain', '{"lat": 41.392733, "lng": 2.15119}', 6.8, '2022-03-18T12:00:00+00:00'),
        ('Mas Uberni Blanc de Blancs', 'Ros Marina Viticultors', 'white', 'Penedès', 'spain', 'young', 2020, 12, 'restaurant', 'Bar Cugat', 'Carrer del Bruc, 99, Eixample, 08009 Barcelona', 'Barcelona', 'spain', '{"lat": 41.395834, "lng": 2.167547}', 18, '2022-06-23T12:00:00+00:00'),
        ('409 2020', 'Pagos del Rey', 'red', 'Ribera del Duero', 'spain', 'crianza', 2020, 14, 'supermarket', 'Vinalium Collblanc', 'Carrer Francesc Layret, 18, 08903 L''Hospitalet de Llobregat, Barcelona', 'Barcelona', 'spain', '{"lat": 41.376442, "lng": 2.12003}', 9.2, '2021-12-21T12:00:00+00:00')
)
INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at, created_at)
SELECT w.id,
       p.id,
       ps.price_paid::numeric,
       ps.purchased_at::timestamptz,
       '2026-04-07T19:45:00+00:00'::timestamptz
FROM purchase_seed ps
INNER JOIN designation_of_origin d ON d.name = ps.do_name
INNER JOIN wine w
    ON w.name = ps.wine_name
   AND COALESCE(w.winery, '') = ps.winery
   AND w.wine_type = ps.wine_type::wine_type
   AND w.do_id = d.id
   AND w.country = ps.country::country
   AND w.aging_type = ps.aging_type::aging_type
   AND w.vintage_year = ps.vintage_year
   AND w.alcohol_percentage = ps.alcohol_percentage::numeric
INNER JOIN place p
    ON p.place_type = ps.place_type::place_type
   AND p.name = ps.place_name
   AND COALESCE(p.address, '') = ps.place_address
   AND COALESCE(p.city, '') = ps.place_city
   AND p.country = ps.place_country::place_country
   AND p.map_data = CAST(ps.place_map_data AS JSONB)
WHERE NOT EXISTS (
    SELECT 1
    FROM wine_purchase wp
    WHERE wp.wine_id = w.id
      AND wp.place_id = p.id
      AND wp.price_paid = ps.price_paid::numeric
      AND wp.purchased_at = ps.purchased_at::timestamptz
)
SQL);
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql("DELETE FROM wine_purchase WHERE created_at = '" . self::BATCH_TIMESTAMP . "'::timestamptz");
        $this->addSql("DELETE FROM wine WHERE created_at = '" . self::BATCH_TIMESTAMP . "'::timestamptz AND updated_at = '" . self::BATCH_TIMESTAMP . "'::timestamptz");

        $this->addSql(<<<'SQL'
WITH place_seed(place_type, name, address, city, country, map_data) AS (
    VALUES
        ('restaurant', 'Glenmoriston Town House Hotel', '21 Ness Bank,  IV2 4SF,', 'Inverness', 'united_kingdom', '{"lat": 57.472778, "lng": -4.227299}'),
        ('restaurant', 'Xavier Pellicer', 'Carrer de Provença, 310, Eixample, 08037 Barcelona', 'Barcelona', 'spain', '{"lat": 41.396049, "lng": 2.163401}'),
        ('restaurant', 'Taberner Amador', 'C. Extensión Agraria, 2, 50794 Nonaspe, Zaragoza', 'Nonaspe', 'spain', '{"lat": 41.209674, "lng": 0.250899}'),
        ('restaurant', 'Capri', 'Manuel Ibañez, S/N, 33590 Colombres, Asturias', 'Colombres', 'spain', '{"lat": 43.383012, "lng": -4.556988}'),
        ('restaurant', 'Casa Amparo', 'C. Arco de los Zapatos, 4, 33001 Oviedo, Asturias', 'Oviedo', 'spain', '{"lat": 43.359954, "lng": -5.846538}'),
        ('supermarket', 'Dia', 'C. Darío de Regoyos, 7-9, 33560 Ribadesella, Asturias', 'Ribadesella', 'spain', '{"lat": 43.463672, "lng": -5.065223}'),
        ('restaurant', 'Bar Galan', 'C/ de Muntaner, 212, Eixample, 08036 Barcelona', 'Barcelona', 'spain', '{"lat": 41.393551, "lng": 2.150455}'),
        ('restaurant', 'Hostal Satuna', 'Passeig de l''Àncora, 14, 17255 Sa Tuna, Girona', 'Begur', 'spain', '{"lat": 41.960147, "lng": 3.229621}'),
        ('supermarket', 'Jespac', 'C/ de Muntaner, 187, Eixample, 08036 Barcelona', 'Barcelona', 'spain', '{"lat": 41.392733, "lng": 2.15119}'),
        ('restaurant', 'Vi Negre', 'Carrer de les Guilleries, 17, local 3, Gràcia, 08012 Barcelona', 'Barcelona', 'spain', '{"lat": 41.403353, "lng": 2.156569}'),
        ('restaurant', 'Restaurant Setze', 'Carrer de Galileu, 316, Les Corts, 08028 Barcelona', 'Barcelona', 'spain', '{"lat": 41.385565, "lng": 2.131631}'),
        ('restaurant', 'Restaurant Les Cols', 'Carretera de la Canya, 106, 17800 Olot, Girona', 'Olot', 'spain', '{"lat": 42.194169, "lng": 2.500077}'),
        ('supermarket', 'La corona de l’ainsa', 'Pl. Mayor, 25, 22330 Aínsa, Huesca', 'Ainsa', 'spain', '{"lat": 42.417414, "lng": 0.138506}'),
        ('restaurant', 'La Gambarrada', 'Pg. del Carme, 22, 08800 Vilanova i la Geltrú, Barcelona', 'Vilanova I la Geltru', 'spain', '{"lat": 41.215263, "lng": 1.726916}'),
        ('restaurant', 'Casa Ruben', 'Avda. Bielsa km 63, 22364 Hospital, Huesca', 'Hospital', 'spain', '{"lat": 41.367911, "lng": 2.096615}'),
        ('restaurant', 'La Palmera', 'Carrer d''Enric Granados, 57, Eixample, 08008 Barcelona', 'Barcelona', 'spain', '{"lat": 41.39088, "lng": 2.158104}'),
        ('restaurant', 'Art I Tapes', 'Carrer de Mallorca, 450, Eixample, 08013 Barcelona', 'Barcelona', 'spain', '{"lat": 41.405011, "lng": 2.177616}'),
        ('restaurant', 'Bar Noe', 'Carrer de Villarroel, 227, Eixample, 08036 Barcelona', 'Barcelona', 'spain', '{"lat": 41.390837, "lng": 2.149026}'),
        ('restaurant', 'Hofmann', 'Carrer de la Granada del Penedès, 14-16, Sarrià-Sant Gervasi, 08006 Barcelona', 'Barcelona', 'spain', '{"lat": 41.397094, "lng": 2.152943}'),
        ('supermarket', 'Aldi', 'Av. de Sarrià, 12, Eixample, 08029 Barcelona', 'Barcelona', 'spain', '{"lat": 41.3903, "lng": 2.145931}'),
        ('restaurant', 'Pla de la Garsa', 'Carrer dels Assaonadors, 13, Ciutat Vella, 08003 Barcelona', 'Barcelona', 'spain', '{"lat": 41.386012, "lng": 2.180593}'),
        ('restaurant', 'Bar Cugat', 'Carrer del Bruc, 99, Eixample, 08009 Barcelona', 'Barcelona', 'spain', '{"lat": 41.395834, "lng": 2.167547}'),
        ('restaurant', 'Vi I Tófona', 'Av. Princep D''Asturies, 56, Gràcia, 08012 Barcelona', 'Barcelona', 'spain', '{"lat": 41.405271, "lng": 2.150241}'),
        ('supermarket', 'Mercadona', 'Carr. de Collblanc, 90, Les Corts, 08028 Barcelona', 'Barcelona', 'spain', '{"lat": 41.375916, "lng": 2.115666}'),
        ('restaurant', 'Taberna La parra', 'Carrer de Joanot Martorell, 3, Sants-Montjuïc, 08014 Barcelona', 'Barcelona', 'spain', '{"lat": 41.374979, "lng": 2.141001}'),
        ('restaurant', 'Cal Ramon', 'Plaça de Sant Joan, 13, 08720 Vilafranca del Penedès, Barcelona', 'Vilafranca del Penedes', 'spain', '{"lat": 41.346141, "lng": 1.698477}'),
        ('supermarket', 'Vinalium Collblanc', 'Carrer Francesc Layret, 18, 08903 L''Hospitalet de Llobregat, Barcelona', 'Barcelona', 'spain', '{"lat": 41.376442, "lng": 2.12003}'),
        ('restaurant', 'Un mondo divino', 'Salizada S. Canzian, 5984/a, 30121 Venezia VE, Italia', 'Venecia', 'italy', '{"lat": 45.437191, "lng": 12.33459}'),
        ('restaurant', 'Devil’s forest pub', 'Calle dei Stagneri o de la Fava, 5185, 30124 Venezia VE, Italia', 'Venecia', 'italy', '{"lat": 45.437191, "lng": 12.33459}'),
        ('restaurant', 'Trattoria Pallottino', 'Via Isola delle Stinche, 1r, 50122 Firenze FI, Italia', 'Florencia', 'italy', '{"lat": 43.769844, "lng": 11.260006}')
)
DELETE FROM place p
USING place_seed ps
WHERE p.place_type = ps.place_type::place_type
  AND p.name = ps.name
  AND COALESCE(p.address, '') = ps.address
  AND COALESCE(p.city, '') = ps.city
  AND p.country = ps.country::place_country
  AND p.map_data = CAST(ps.map_data AS JSONB)
  AND NOT EXISTS (
      SELECT 1
      FROM wine_purchase wp
      WHERE wp.place_id = p.id
  )
SQL);
    }
}
