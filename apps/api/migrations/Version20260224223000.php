<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\Migrations\AbstractMigration;

final class Version20260224223000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create PostgreSQL enum types and initial wine platform schema (v1)';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        foreach (self::upSql() as $sql) {
            $this->addSql($sql);
        }
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        foreach (self::downSql() as $sql) {
            $this->addSql($sql);
        }
    }

    /**
     * @return list<string>
     */
    private static function upSql(): array
    {
        return [
            "CREATE TYPE wine_type AS ENUM ('red', 'white', 'rose', 'sparkling', 'sweet', 'fortified')",
            "CREATE TYPE aging_type AS ENUM ('young', 'crianza', 'reserve', 'grand_reserve')",
            "CREATE TYPE country AS ENUM ('spain', 'france', 'italy', 'portugal', 'germany', 'argentina', 'chile', 'united_states', 'south_africa', 'australia')",
            "CREATE TYPE place_type AS ENUM ('supermarket', 'restaurant')",
            "CREATE TYPE photo_type AS ENUM ('front_label', 'back_label', 'bottle')",
            "CREATE TYPE award_name AS ENUM ('penin', 'parker', 'wine_spectator', 'decanter', 'james_suckling', 'guia_proensa')",
            "CREATE TYPE review_bullet AS ENUM ('fruity', 'floral', 'spicy', 'mineral', 'oak_forward', 'easy_drinking', 'elegant', 'powerful', 'food_friendly')",
            "CREATE TYPE grape_color AS ENUM ('red', 'white')",
            <<<'SQL'
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  lastname VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
SQL,
            <<<'SQL'
CREATE TABLE region_do (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country country NOT NULL,
  UNIQUE (country, name)
)
SQL,
            <<<'SQL'
CREATE TABLE place (
  id BIGSERIAL PRIMARY KEY,
  place_type place_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  city VARCHAR(120),
  CONSTRAINT place_fields_by_type_chk CHECK (
    (place_type = 'supermarket' AND address IS NULL AND city IS NULL) OR
    (place_type = 'restaurant' AND address IS NOT NULL AND city IS NOT NULL)
  )
)
SQL,
            "CREATE TABLE grape (id BIGSERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL UNIQUE, color grape_color NOT NULL)",
            <<<'SQL'
CREATE TABLE wine (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  winery VARCHAR(255) NOT NULL,
  wine_type wine_type NOT NULL,
  region_do_id BIGINT NOT NULL REFERENCES region_do(id),
  country country NOT NULL,
  aging_type aging_type,
  vintage_year INT CHECK (vintage_year IS NULL OR (vintage_year >= 1800 AND vintage_year <= 2200)),
  alcohol_percentage INT CHECK (alcohol_percentage IS NULL OR (alcohol_percentage >= 0 AND alcohol_percentage <= 100)),
  purchase_place_id BIGINT NOT NULL REFERENCES place(id),
  price_paid NUMERIC(10,2) NOT NULL CHECK (price_paid >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
SQL,
            "CREATE INDEX wine_winery_name_vintage_idx ON wine (winery, name, vintage_year)",
            "CREATE INDEX wine_country_region_idx ON wine (country, region_do_id)",
            <<<'SQL'
CREATE TABLE wine_grape (
  wine_id BIGINT NOT NULL REFERENCES wine(id) ON DELETE CASCADE,
  grape_id BIGINT NOT NULL REFERENCES grape(id),
  percentage NUMERIC(5,2) CHECK (percentage IS NULL OR (percentage >= 0 AND percentage <= 100)),
  PRIMARY KEY (wine_id, grape_id)
)
SQL,
            "CREATE TABLE photo (id BIGSERIAL PRIMARY KEY, wine_id BIGINT NOT NULL REFERENCES wine(id) ON DELETE CASCADE, url TEXT NOT NULL, type photo_type)",
            <<<'SQL'
CREATE TABLE award (
  id BIGSERIAL PRIMARY KEY,
  wine_id BIGINT NOT NULL REFERENCES wine(id) ON DELETE CASCADE,
  name award_name NOT NULL,
  score NUMERIC(5,2),
  year INT CHECK (year IS NULL OR (year >= 1800 AND year <= 2200))
)
SQL,
            "CREATE INDEX award_wine_name_year_idx ON award (wine_id, name, year)",
            <<<'SQL'
CREATE TABLE review (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wine_id BIGINT NOT NULL REFERENCES wine(id) ON DELETE CASCADE,
  score INT CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  intensity_aroma SMALLINT NOT NULL CHECK (intensity_aroma BETWEEN 0 AND 5),
  sweetness SMALLINT NOT NULL CHECK (sweetness BETWEEN 0 AND 5),
  acidity SMALLINT NOT NULL CHECK (acidity BETWEEN 0 AND 5),
  tannin SMALLINT CHECK (tannin IS NULL OR tannin BETWEEN 0 AND 5),
  body SMALLINT NOT NULL CHECK (body BETWEEN 0 AND 5),
  persistence SMALLINT NOT NULL CHECK (persistence BETWEEN 0 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, wine_id)
)
SQL,
            "CREATE TABLE review_bullets (review_id BIGINT NOT NULL REFERENCES review(id) ON DELETE CASCADE, bullet review_bullet NOT NULL, PRIMARY KEY (review_id, bullet))",
        ];
    }

    /**
     * @return list<string>
     */
    private static function downSql(): array
    {
        return [
            'DROP TABLE IF EXISTS review_bullets',
            'DROP TABLE IF EXISTS review',
            'DROP TABLE IF EXISTS award',
            'DROP TABLE IF EXISTS photo',
            'DROP TABLE IF EXISTS wine_grape',
            'DROP TABLE IF EXISTS wine',
            'DROP TABLE IF EXISTS grape',
            'DROP TABLE IF EXISTS place',
            'DROP TABLE IF EXISTS region_do',
            'DROP TABLE IF EXISTS users',
            'DROP TYPE IF EXISTS review_bullet',
            'DROP TYPE IF EXISTS award_name',
            'DROP TYPE IF EXISTS photo_type',
            'DROP TYPE IF EXISTS grape_color',
            'DROP TYPE IF EXISTS place_type',
            'DROP TYPE IF EXISTS country',
            'DROP TYPE IF EXISTS aging_type',
            'DROP TYPE IF EXISTS wine_type',
        ];
    }
}
