-- PostgreSQL schema (v1)
-- Canonical enum values are English lowercase snake_case.

-- ==============================
-- ENUM TYPES
-- ==============================
CREATE TYPE wine_type AS ENUM (
  'red', 'white', 'rose', 'sparkling', 'sweet', 'fortified'
);

CREATE TYPE aging_type AS ENUM (
  'young', 'crianza', 'reserve', 'grand_reserve'
);

CREATE TYPE country AS ENUM (
  'spain', 'france', 'italy', 'portugal', 'germany',
  'argentina', 'chile', 'united_states', 'south_africa', 'australia'
);

CREATE TYPE place_type AS ENUM ('supermarket', 'restaurant');

CREATE TYPE photo_type AS ENUM ('front_label', 'back_label', 'bottle');

CREATE TYPE award_name AS ENUM (
  'penin', 'parker', 'wine_spectator', 'decanter', 'james_suckling', 'guia_proensa'
);

CREATE TYPE review_bullet AS ENUM (
  'fruity', 'floral', 'spicy', 'mineral', 'oak_forward',
  'easy_drinking', 'elegant', 'powerful', 'food_friendly'
);

CREATE TYPE grape_color AS ENUM ('red', 'white');

-- ==============================
-- TABLES
-- ==============================
CREATE TABLE users (
  id              BIGSERIAL PRIMARY KEY,
  email           VARCHAR(255) NOT NULL UNIQUE,
  name            VARCHAR(120) NOT NULL,
  lastname        VARCHAR(120) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE region_do (
  id        BIGSERIAL PRIMARY KEY,
  name      VARCHAR(255) NOT NULL,
  country   country NOT NULL,
  UNIQUE (country, name)
);

CREATE TABLE place (
  id          BIGSERIAL PRIMARY KEY,
  place_type  place_type NOT NULL,
  name        VARCHAR(255) NOT NULL,
  address     VARCHAR(255),
  city        VARCHAR(120),
  CONSTRAINT place_fields_by_type_chk CHECK (
    (place_type = 'supermarket' AND address IS NULL AND city IS NULL) OR
    (place_type = 'restaurant'  AND address IS NOT NULL AND city IS NOT NULL)
  )
);

CREATE TABLE grape (
  id      BIGSERIAL PRIMARY KEY,
  name    VARCHAR(255) NOT NULL UNIQUE,
  color   grape_color NOT NULL
);

CREATE TABLE wine (
  id                  BIGSERIAL PRIMARY KEY,
  name                VARCHAR(255) NOT NULL,
  winery              VARCHAR(255) NOT NULL,
  wine_type           wine_type NOT NULL,
  region_do_id        BIGINT NOT NULL REFERENCES region_do(id),
  country             country NOT NULL,
  aging_type          aging_type,
  vintage_year        INT CHECK (vintage_year IS NULL OR (vintage_year >= 1800 AND vintage_year <= 2200)),
  alcohol_percentage  INT CHECK (alcohol_percentage IS NULL OR (alcohol_percentage >= 0 AND alcohol_percentage <= 100)),
  purchase_place_id   BIGINT NOT NULL REFERENCES place(id),
  price_paid          NUMERIC(10,2) NOT NULL CHECK (price_paid >= 0),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX wine_winery_name_vintage_idx ON wine (winery, name, vintage_year);
CREATE INDEX wine_country_region_idx ON wine (country, region_do_id);

CREATE TABLE wine_grape (
  wine_id     BIGINT NOT NULL REFERENCES wine(id) ON DELETE CASCADE,
  grape_id    BIGINT NOT NULL REFERENCES grape(id),
  percentage  NUMERIC(5,2) CHECK (percentage IS NULL OR (percentage >= 0 AND percentage <= 100)),
  PRIMARY KEY (wine_id, grape_id)
);

CREATE TABLE photo (
  id       BIGSERIAL PRIMARY KEY,
  wine_id  BIGINT NOT NULL REFERENCES wine(id) ON DELETE CASCADE,
  url      TEXT NOT NULL,
  type     photo_type
);

CREATE TABLE award (
  id       BIGSERIAL PRIMARY KEY,
  wine_id  BIGINT NOT NULL REFERENCES wine(id) ON DELETE CASCADE,
  name     award_name NOT NULL,
  score    NUMERIC(5,2),
  year     INT CHECK (year IS NULL OR (year >= 1800 AND year <= 2200))
);

CREATE INDEX award_wine_name_year_idx ON award (wine_id, name, year);

CREATE TABLE review (
  id                 BIGSERIAL PRIMARY KEY,
  user_id            BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wine_id            BIGINT NOT NULL REFERENCES wine(id) ON DELETE CASCADE,
  score              INT CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  intensity_aroma    SMALLINT NOT NULL CHECK (intensity_aroma BETWEEN 0 AND 5),
  sweetness          SMALLINT NOT NULL CHECK (sweetness BETWEEN 0 AND 5),
  acidity            SMALLINT NOT NULL CHECK (acidity BETWEEN 0 AND 5),
  tannin             SMALLINT CHECK (tannin IS NULL OR tannin BETWEEN 0 AND 5),
  body               SMALLINT NOT NULL CHECK (body BETWEEN 0 AND 5),
  persistence        SMALLINT NOT NULL CHECK (persistence BETWEEN 0 AND 5),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, wine_id)
);

CREATE TABLE review_bullets (
  review_id  BIGINT NOT NULL REFERENCES review(id) ON DELETE CASCADE,
  bullet     review_bullet NOT NULL,
  PRIMARY KEY (review_id, bullet)
);
