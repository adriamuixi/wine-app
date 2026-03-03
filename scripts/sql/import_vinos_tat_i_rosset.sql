-- Active: 1772491643341@@localhost@5432@wine
-- Import CSV: vinos-tat i rosset.csv
-- Inserts only into: wine, wine_grape, place, wine_purchase, review
-- FK IDs used from current DB: users(2,3), DO and grapes mapped below.
-- score 0..10 -> 0..100 integer; sensory axes defaults = 3 (tannin NULL for whites).
BEGIN;

-- CSV line 2: Lo cometa
DO $$
DECLARE
    v_wine_id BIGINT;
    v_place_id BIGINT;
BEGIN
    INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
    VALUES ('Lo cometa', 'Abanico', 'white', 79, 'spain', 'young', 2019, '13.5')
    RETURNING id INTO v_wine_id;

    INSERT INTO place (place_type, name, address, city, country)
    VALUES ('restaurant', 'Celler del nou priorat', 'Carrer del Vallespir, 19', 'Barcelona', 'spain')
    RETURNING id INTO v_place_id;

    INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at)
    VALUES (v_wine_id, v_place_id, '18.00', '2020-09-26 12:00:00+00'::timestamptz);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 63, NULL);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (2,v_wine_id, 70, 6, 3, 6, NULL, 6, 8, '2020-09-26 12:00:00+00'::timestamptz);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (1,v_wine_id, 75, 10, 2, 7, NULL, 8, 8, '2020-09-26 12:00:00+00'::timestamptz);
END $$;

-- CSV line 3: Compte ovelles
DO $$
DECLARE
    v_wine_id BIGINT;
    v_place_id BIGINT;
BEGIN
    INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
    VALUES ('Compte ovelles', 'Ferré i Catasús', 'red', 75, 'spain', 'young', 2020, '13.0')
    RETURNING id INTO v_wine_id;

    INSERT INTO place (place_type, name, address, city, country)
    VALUES ('supermarket', 'Supermercat', NULL, NULL, 'spain')
    RETURNING id INTO v_place_id;

    INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at)
    VALUES (v_wine_id, v_place_id, '5.45', '2020-09-27 12:00:00+00'::timestamptz);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 59, NULL);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 57, NULL);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 58, NULL);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (2,v_wine_id, 50, 4, 2, 4, 6, 5, 5, '2020-09-27 12:00:00+00'::timestamptz);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (1,v_wine_id, 58, 6, 2, 4, 7, 7, 6, '2020-09-27 12:00:00+00'::timestamptz);
END $$;

-- CSV line 4: Seré 2018
DO $$
DECLARE
    v_wine_id BIGINT;
    v_place_id BIGINT;
BEGIN
    INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
    VALUES ('Seré 2018', 'Vendrell Rived', 'red', 74, 'spain', 'crianza', 2018, '14.5')
    RETURNING id INTO v_wine_id;

    INSERT INTO place (place_type, name, address, city, country)
    VALUES ('restaurant', 'Taberna la parra', 'Carrer de Joanot Martorell, 3', 'Barcelona', 'spain')
    RETURNING id INTO v_place_id;

    INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at)
    VALUES (v_wine_id, v_place_id, '19.00', '2020-10-09 12:00:00+00'::timestamptz);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 63, NULL);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 76, NULL);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (2,v_wine_id, 65, 6, 1, 5, 8, 7, 7, '2020-10-09 12:00:00+00'::timestamptz);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (1,v_wine_id, 63, 6, 2, 4, 7, 7, 6, '2020-10-09 12:00:00+00'::timestamptz);
END $$;

-- CSV line 5: Vega de Nava
DO $$
DECLARE
    v_wine_id BIGINT;
    v_place_id BIGINT;
BEGIN
    INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
    VALUES ('Vega de Nava', 'Vega de Nava', 'red', 62, 'spain', 'reserve', 2018, '14.0')
    RETURNING id INTO v_wine_id;

    INSERT INTO place (place_type, name, address, city, country)
    VALUES ('supermarket', 'Supermercat', NULL, NULL, 'spain')
    RETURNING id INTO v_place_id;

    INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at)
    VALUES (v_wine_id, v_place_id, '6.25', '2020-10-09 12:00:00+00'::timestamptz);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 64, NULL);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (2,v_wine_id, 80, 7, 1, 5, 9, 8, 8, '2020-10-09 12:00:00+00'::timestamptz);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (1,v_wine_id, 80, 10, 1, 6, 8, 9, 9, '2020-10-09 12:00:00+00'::timestamptz);
END $$;

-- CSV line 6: Chateldon
DO $$
DECLARE
    v_wine_id BIGINT;
    v_place_id BIGINT;
BEGIN
    INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
    VALUES ('Chateldon', 'Pinord', 'red', 75, 'spain', 'reserve', 2019, '13.5')
    RETURNING id INTO v_wine_id;

    INSERT INTO place (place_type, name, address, city, country)
    VALUES ('supermarket', 'Supermercat', NULL, NULL, 'spain')
    RETURNING id INTO v_place_id;

    INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at)
    VALUES (v_wine_id, v_place_id, '10.45', '2020-10-23 12:00:00+00'::timestamptz);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 57, NULL);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (2,v_wine_id, 80, 7, 1, 5, 9, 8, 8, '2020-10-23 12:00:00+00'::timestamptz);
END $$;

-- CSV line 7: Matsu - el pícaro
DO $$
DECLARE
    v_wine_id BIGINT;
    v_place_id BIGINT;
BEGIN
    INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
    VALUES ('Matsu - el pícaro', 'Matsu', 'red', 66, 'spain', 'young', 2020, '14.5')
    RETURNING id INTO v_wine_id;

    INSERT INTO place (place_type, name, address, city, country)
    VALUES ('supermarket', 'Supermercat', NULL, NULL, 'spain')
    RETURNING id INTO v_place_id;

    INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at)
    VALUES (v_wine_id, v_place_id, '7.90', '2020-10-24 12:00:00+00'::timestamptz);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 64, NULL);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (2,v_wine_id, 75, 7, 1, 5, 9, 8, 8, '2020-10-24 12:00:00+00'::timestamptz);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (1,v_wine_id, 80, 10, 1, 6, 8, 9, 9, '2020-10-24 12:00:00+00'::timestamptz);
END $$;

-- CSV line 8: Titella
DO $$
DECLARE
    v_wine_id BIGINT;
    v_place_id BIGINT;
BEGIN
    INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
    VALUES ('Titella', 'Titella', 'red', 74, 'spain', 'young', 2017, '13.5')
    RETURNING id INTO v_wine_id;

    INSERT INTO place (place_type, name, address, city, country)
    VALUES ('supermarket', 'Supermercat', NULL, NULL, 'spain')
    RETURNING id INTO v_place_id;

    INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at)
    VALUES (v_wine_id, v_place_id, '5.20', '2020-11-06 12:00:00+00'::timestamptz);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 63, NULL);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 76, NULL);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 58, NULL);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 64, NULL);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (2,v_wine_id, 80, 7, 1, 5, 9, 8, 8, '2020-11-06 12:00:00+00'::timestamptz);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (1,v_wine_id, 81, 6, 1, 6, 9, 8, 9, '2020-11-06 12:00:00+00'::timestamptz);
END $$;

-- CSV line 9: Ulldemolins
DO $$
DECLARE
    v_wine_id BIGINT;
    v_place_id BIGINT;
BEGIN
    INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
    VALUES ('Ulldemolins', 'Agrícola d''Ulldemolins', 'red', 74, 'spain', 'crianza', 2016, '14.5')
    RETURNING id INTO v_wine_id;

    INSERT INTO place (place_type, name, address, city, country)
    VALUES ('supermarket', 'Supermercat', NULL, NULL, 'spain')
    RETURNING id INTO v_place_id;

    INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at)
    VALUES (v_wine_id, v_place_id, '5.80', '2020-11-08 12:00:00+00'::timestamptz);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 63, NULL);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (2,v_wine_id, 65, 6, 1, 5, 8, 7, 7, '2020-11-08 12:00:00+00'::timestamptz);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (1,v_wine_id, 68, 7, 2, 5, 8, 8, 7, '2020-11-08 12:00:00+00'::timestamptz);
END $$;

-- CSV line 10: Clot d’encís
DO $$
DECLARE
    v_wine_id BIGINT;
    v_place_id BIGINT;
BEGIN
    INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
    VALUES ('Clot d’encís', 'Agrícola Sant Josep Bot', 'white', 79, 'spain', 'young', 2019, '14.0')
    RETURNING id INTO v_wine_id;

    INSERT INTO place (place_type, name, address, city, country)
    VALUES ('supermarket', 'Supermercat', NULL, NULL, 'spain')
    RETURNING id INTO v_place_id;

    INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at)
    VALUES (v_wine_id, v_place_id, '4.10', '2020-11-20 12:00:00+00'::timestamptz);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 63, NULL);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (2,v_wine_id, 75, 7, 3, 6, NULL, 7, 9, '2020-11-20 12:00:00+00'::timestamptz);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (1,v_wine_id, 72, 6, 3, 6, NULL, 6, 8, '2020-11-20 12:00:00+00'::timestamptz);
END $$;

-- CSV line 11: Ninín
DO $$
DECLARE
    v_wine_id BIGINT;
    v_place_id BIGINT;
BEGIN
    INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
    VALUES ('Ninín', 'Izquierdo', 'red', 62, 'spain', 'crianza', 2018, '14.0')
    RETURNING id INTO v_wine_id;

    INSERT INTO place (place_type, name, address, city, country)
    VALUES ('supermarket', 'Supermercat', NULL, NULL, 'spain')
    RETURNING id INTO v_place_id;

    INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at)
    VALUES (v_wine_id, v_place_id, '7.80', '2020-11-21 12:00:00+00'::timestamptz);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 64, NULL);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (2,v_wine_id, 68, 9, 1, 6, 7, 8, 8, '2020-11-21 12:00:00+00'::timestamptz);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (1,v_wine_id, 69, 8, 1, 5, 7, 8, 8, '2020-11-21 12:00:00+00'::timestamptz);
END $$;

-- CSV line 12: Rocablanca
DO $$
DECLARE
    v_wine_id BIGINT;
    v_place_id BIGINT;
BEGIN
    INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
    VALUES ('Rocablanca', 'Rocablanca', 'red', 74, 'spain', 'crianza', 2016, '13.5')
    RETURNING id INTO v_wine_id;

    INSERT INTO place (place_type, name, address, city, country)
    VALUES ('supermarket', 'Supermercat', NULL, NULL, 'spain')
    RETURNING id INTO v_place_id;

    INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at)
    VALUES (v_wine_id, v_place_id, '5.67', '2020-12-01 12:00:00+00'::timestamptz);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 63, NULL);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 77, NULL);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 59, NULL);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (2,v_wine_id, 60, 5, 1, 4, 7, 6, 6, '2020-12-01 12:00:00+00'::timestamptz);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (1,v_wine_id, 43, 4, 3, 4, 5, 5, 4, '2020-12-01 12:00:00+00'::timestamptz);
END $$;

-- CSV line 13: Enate
DO $$
DECLARE
    v_wine_id BIGINT;
    v_place_id BIGINT;
BEGIN
    INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
    VALUES ('Enate', 'Enate', 'red', 15, 'spain', 'young', 2017, '15.0')
    RETURNING id INTO v_wine_id;

    INSERT INTO place (place_type, name, address, city, country)
    VALUES ('supermarket', 'Supermercat', NULL, NULL, 'spain')
    RETURNING id INTO v_place_id;

    INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at)
    VALUES (v_wine_id, v_place_id, '6.50', '2020-12-04 12:00:00+00'::timestamptz);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 57, NULL);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 58, NULL);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (2,v_wine_id, 70, 6, 1, 5, 8, 7, 7, '2020-12-04 12:00:00+00'::timestamptz);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (1,v_wine_id, 80, 10, 1, 6, 8, 9, 9, '2020-12-04 12:00:00+00'::timestamptz);
END $$;

-- CSV line 14: Fulget
DO $$
DECLARE
    v_wine_id BIGINT;
    v_place_id BIGINT;
BEGIN
    INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
    VALUES ('Fulget', 'Maior de Mendoza', 'white', 82, 'spain', 'young', 2019, '12.0')
    RETURNING id INTO v_wine_id;

    INSERT INTO place (place_type, name, address, city, country)
    VALUES ('restaurant', 'A''rogueira', 'Av. de Josep Tarradellas, 20-30', 'Barcelona', 'spain')
    RETURNING id INTO v_place_id;

    INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at)
    VALUES (v_wine_id, v_place_id, '17.50', '2020-12-06 12:00:00+00'::timestamptz);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 25, NULL);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (2,v_wine_id, 65, 6, 3, 6, NULL, 6, 8, '2020-12-06 12:00:00+00'::timestamptz);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (1,v_wine_id, 55, 8, 2, 6, NULL, 6, 6, '2020-12-06 12:00:00+00'::timestamptz);
END $$;

-- CSV line 15: Castillo de Albai
DO $$
DECLARE
    v_wine_id BIGINT;
    v_place_id BIGINT;
BEGIN
    INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
    VALUES ('Castillo de Albai', 'Pagos del Rey', 'red', 2, 'spain', 'reserve', 2016, '13.5')
    RETURNING id INTO v_wine_id;

    INSERT INTO place (place_type, name, address, city, country)
    VALUES ('supermarket', 'Supermercat', NULL, NULL, 'spain')
    RETURNING id INTO v_place_id;

    INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at)
    VALUES (v_wine_id, v_place_id, '4.70', '2020-12-19 12:00:00+00'::timestamptz);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 64, NULL);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (2,v_wine_id, 70, 6, 1, 5, 8, 7, 7, '2020-12-19 12:00:00+00'::timestamptz);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (1,v_wine_id, 71, 5, 1, 6, 8, 7, 8, '2020-12-19 12:00:00+00'::timestamptz);
END $$;

-- CSV line 16: Acústic
DO $$
DECLARE
    v_wine_id BIGINT;
    v_place_id BIGINT;
BEGIN
    INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
    VALUES ('Acústic', 'Acústic Celler', 'red', 74, 'spain', 'crianza', 2018, '15.0')
    RETURNING id INTO v_wine_id;

    INSERT INTO place (place_type, name, address, city, country)
    VALUES ('supermarket', 'Supermercat', NULL, NULL, 'spain')
    RETURNING id INTO v_place_id;

    INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at)
    VALUES (v_wine_id, v_place_id, '12.40', '2020-12-24 12:00:00+00'::timestamptz);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 63, NULL);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 76, NULL);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (2,v_wine_id, 92, 10, 1, 6, 9, 10, 10, '2020-12-24 12:00:00+00'::timestamptz);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (1,v_wine_id, 81, 6, 1, 6, 9, 8, 9, '2020-12-24 12:00:00+00'::timestamptz);
END $$;

-- CSV line 17: Matsu - el recio
DO $$
DECLARE
    v_wine_id BIGINT;
    v_place_id BIGINT;
BEGIN
    INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
    VALUES ('Matsu - el recio', 'Matsu', 'red', 66, 'spain', 'crianza', 2018, '14.5')
    RETURNING id INTO v_wine_id;

    INSERT INTO place (place_type, name, address, city, country)
    VALUES ('supermarket', 'Supermercat', NULL, NULL, 'spain')
    RETURNING id INTO v_place_id;

    INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at)
    VALUES (v_wine_id, v_place_id, '9.45', '2020-12-25 12:00:00+00'::timestamptz);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (2,v_wine_id, 90, 8, 1, 6, 10, 9, 9, '2020-12-25 12:00:00+00'::timestamptz);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (1,v_wine_id, 78, 8, 2, 5, 9, 9, 8, '2020-12-25 12:00:00+00'::timestamptz);
END $$;

-- CSV line 18: Roureda
DO $$
DECLARE
    v_wine_id BIGINT;
    v_place_id BIGINT;
BEGIN
    INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
    VALUES ('Roureda', 'Cellers Unio', 'red', 78, 'spain', 'reserve', 2016, '13.0')
    RETURNING id INTO v_wine_id;

    INSERT INTO place (place_type, name, address, city, country)
    VALUES ('supermarket', 'Supermercat', NULL, NULL, 'spain')
    RETURNING id INTO v_place_id;

    INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at)
    VALUES (v_wine_id, v_place_id, '5.15', '2020-12-26 12:00:00+00'::timestamptz);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 64, NULL);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 57, NULL);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 58, NULL);
END $$;

-- CSV line 19: Almodí
DO $$
DECLARE
    v_wine_id BIGINT;
    v_place_id BIGINT;
BEGIN
    INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
    VALUES ('Almodí', 'Altavins', 'red', 79, 'spain', 'young', 2019, '14.5')
    RETURNING id INTO v_wine_id;

    INSERT INTO place (place_type, name, address, city, country)
    VALUES ('supermarket', 'Supermercat', NULL, NULL, 'spain')
    RETURNING id INTO v_place_id;

    INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at)
    VALUES (v_wine_id, v_place_id, '8.90', '2021-01-15 12:00:00+00'::timestamptz);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 63, NULL);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (2,v_wine_id, 75, 7, 1, 5, 9, 8, 8, '2021-01-15 12:00:00+00'::timestamptz);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (1,v_wine_id, 75, 10, 1, 6, 8, 9, 9, '2021-01-15 12:00:00+00'::timestamptz);
END $$;

-- CSV line 20: Muga
DO $$
DECLARE
    v_wine_id BIGINT;
    v_place_id BIGINT;
BEGIN
    INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
    VALUES ('Muga', 'Muga', 'red', 2, 'spain', 'crianza', 2017, '14.0')
    RETURNING id INTO v_wine_id;

    INSERT INTO place (place_type, name, address, city, country)
    VALUES ('supermarket', 'Supermercat', NULL, NULL, 'spain')
    RETURNING id INTO v_place_id;

    INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at)
    VALUES (v_wine_id, v_place_id, '12.30', '2021-01-23 12:00:00+00'::timestamptz);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 64, NULL);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 63, NULL);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 81, NULL);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (2,v_wine_id, 80, 7, 1, 5, 9, 8, 8, '2021-01-23 12:00:00+00'::timestamptz);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (1,v_wine_id, 70, 9, 1, 6, 7, 8, 8, '2021-01-23 12:00:00+00'::timestamptz);
END $$;

-- CSV line 21: L'isard
DO $$
DECLARE
    v_wine_id BIGINT;
    v_place_id BIGINT;
BEGIN
    INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
    VALUES ('L''isard', 'Casa Ravella', 'red', 75, 'spain', 'young', 2019, '13.5')
    RETURNING id INTO v_wine_id;

    INSERT INTO place (place_type, name, address, city, country)
    VALUES ('supermarket', 'Supermercat', NULL, NULL, 'spain')
    RETURNING id INTO v_place_id;

    INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at)
    VALUES (v_wine_id, v_place_id, '7.20', '2012-01-29 12:00:00+00'::timestamptz);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 63, NULL);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (2,v_wine_id, 77, 9, 1, 5, 8, 9, 9, '2012-01-29 12:00:00+00'::timestamptz);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (1,v_wine_id, 71, 5, 1, 6, 8, 7, 8, '2012-01-29 12:00:00+00'::timestamptz);
END $$;

-- CSV line 22: Sumarroca classic
DO $$
DECLARE
    v_wine_id BIGINT;
    v_place_id BIGINT;
BEGIN
    INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
    VALUES ('Sumarroca classic', 'Sumarroca', 'red', 75, 'spain', 'young', 2019, '13')
    RETURNING id INTO v_wine_id;

    INSERT INTO place (place_type, name, address, city, country)
    VALUES ('supermarket', 'Supermercat', NULL, NULL, 'spain')
    RETURNING id INTO v_place_id;

    INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at)
    VALUES (v_wine_id, v_place_id, '6.80', '2021-02-19 12:00:00+00'::timestamptz);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 58, NULL);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 57, NULL);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 64, NULL);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (2,v_wine_id, 70, 6, 1, 5, 8, 7, 7, '2021-02-19 12:00:00+00'::timestamptz);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (1,v_wine_id, 80, 10, 1, 6, 8, 9, 9, '2021-02-19 12:00:00+00'::timestamptz);
END $$;

-- CSV line 23: Condado de Teón - Roble
DO $$
DECLARE
    v_wine_id BIGINT;
    v_place_id BIGINT;
BEGIN
    INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
    VALUES ('Condado de Teón - Roble', 'Condado de Teón', 'red', 62, 'spain', 'crianza', 2018, '14.0')
    RETURNING id INTO v_wine_id;

    INSERT INTO place (place_type, name, address, city, country)
    VALUES ('supermarket', 'Supermercat', NULL, NULL, 'spain')
    RETURNING id INTO v_place_id;

    INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at)
    VALUES (v_wine_id, v_place_id, '5.80', '2021-03-12 12:00:00+00'::timestamptz);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 64, NULL);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (2,v_wine_id, 65, 6, 1, 5, 8, 7, 7, '2021-03-12 12:00:00+00'::timestamptz);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (1,v_wine_id, 61, 4, 1, 5, 7, 6, 7, '2021-03-12 12:00:00+00'::timestamptz);
END $$;

-- CSV line 24: Rosum
DO $$
DECLARE
    v_wine_id BIGINT;
    v_place_id BIGINT;
BEGIN
    INSERT INTO wine (name, winery, wine_type, do_id, country, aging_type, vintage_year, alcohol_percentage)
    VALUES ('Rosum', 'Rejadorada', 'red', 66, 'spain', 'crianza', 2017, '14.5')
    RETURNING id INTO v_wine_id;

    INSERT INTO place (place_type, name, address, city, country)
    VALUES ('supermarket', 'Supermercat', NULL, NULL, 'spain')
    RETURNING id INTO v_place_id;

    INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at)
    VALUES (v_wine_id, v_place_id, '8.20', '2021-04-23 12:00:00+00'::timestamptz);
    INSERT INTO wine_grape (wine_id, grape_id, percentage) VALUES (v_wine_id, 64, NULL);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (2,v_wine_id, 85, 8, 1, 6, 10, 9, 9, '2021-04-23 12:00:00+00'::timestamptz);
    INSERT INTO review (user_id, wine_id, score, intensity_aroma, sweetness, acidity, tannin, body, persistence, created_at)
    VALUES (1,v_wine_id, 71, 5, 1, 6, 8, 7, 8, '2021-04-23 12:00:00+00'::timestamptz);
END $$;

COMMIT;
