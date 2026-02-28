<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260228130000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Move wine purchase data (place and price) to wine_purchase table with purchase date';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
CREATE TABLE wine_purchase (
  id BIGSERIAL PRIMARY KEY,
  wine_id BIGINT NOT NULL REFERENCES wine(id) ON DELETE CASCADE,
  place_id BIGINT NOT NULL REFERENCES place(id),
  price_paid NUMERIC(10,2) NOT NULL CHECK (price_paid >= 0),
  purchased_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
SQL);
        $this->addSql('CREATE INDEX wine_purchase_wine_purchased_at_idx ON wine_purchase (wine_id, purchased_at DESC)');

        $this->addSql(<<<'SQL'
INSERT INTO wine_purchase (wine_id, place_id, price_paid, purchased_at, created_at)
SELECT id, purchase_place_id, price_paid, created_at, now()
FROM wine
SQL);

        $this->addSql('ALTER TABLE wine DROP COLUMN purchase_place_id');
        $this->addSql('ALTER TABLE wine DROP COLUMN price_paid');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('ALTER TABLE wine ADD COLUMN purchase_place_id BIGINT DEFAULT NULL');
        $this->addSql('ALTER TABLE wine ADD COLUMN price_paid NUMERIC(10,2) DEFAULT NULL');

        $this->addSql(<<<'SQL'
UPDATE wine w
SET purchase_place_id = latest.place_id,
    price_paid = latest.price_paid
FROM (
  SELECT DISTINCT ON (wine_id) wine_id, place_id, price_paid
  FROM wine_purchase
  ORDER BY wine_id, purchased_at DESC, id DESC
) latest
WHERE latest.wine_id = w.id
SQL);

        $this->addSql('ALTER TABLE wine ADD CONSTRAINT wine_purchase_place_id_fkey FOREIGN KEY (purchase_place_id) REFERENCES place(id)');

        $this->addSql('DROP TABLE IF EXISTS wine_purchase');
    }
}
