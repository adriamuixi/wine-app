<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260303123000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Expand review axes/tannin constraints from 0..5 to 0..10';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT con.conname
    FROM pg_constraint con
    INNER JOIN pg_class rel ON rel.oid = con.conrelid
    INNER JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE rel.relname = 'review'
      AND nsp.nspname = current_schema()
      AND con.contype = 'c'
      AND (
        pg_get_constraintdef(con.oid) LIKE '%intensity_aroma BETWEEN 0 AND 5%'
        OR pg_get_constraintdef(con.oid) LIKE '%sweetness BETWEEN 0 AND 5%'
        OR pg_get_constraintdef(con.oid) LIKE '%acidity BETWEEN 0 AND 5%'
        OR pg_get_constraintdef(con.oid) LIKE '%tannin BETWEEN 0 AND 5%'
        OR pg_get_constraintdef(con.oid) LIKE '%body BETWEEN 0 AND 5%'
        OR pg_get_constraintdef(con.oid) LIKE '%persistence BETWEEN 0 AND 5%'
      )
  LOOP
    EXECUTE format('ALTER TABLE review DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;
SQL);

        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_intensity_aroma_0_10_chk CHECK (intensity_aroma BETWEEN 0 AND 10)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_sweetness_0_10_chk CHECK (sweetness BETWEEN 0 AND 10)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_acidity_0_10_chk CHECK (acidity BETWEEN 0 AND 10)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_tannin_0_10_chk CHECK (tannin IS NULL OR tannin BETWEEN 0 AND 10)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_body_0_10_chk CHECK (body BETWEEN 0 AND 10)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_persistence_0_10_chk CHECK (persistence BETWEEN 0 AND 10)');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('UPDATE review SET intensity_aroma = LEAST(intensity_aroma, 5)');
        $this->addSql('UPDATE review SET sweetness = LEAST(sweetness, 5)');
        $this->addSql('UPDATE review SET acidity = LEAST(acidity, 5)');
        $this->addSql('UPDATE review SET tannin = LEAST(tannin, 5) WHERE tannin IS NOT NULL');
        $this->addSql('UPDATE review SET body = LEAST(body, 5)');
        $this->addSql('UPDATE review SET persistence = LEAST(persistence, 5)');

        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_intensity_aroma_0_10_chk');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_sweetness_0_10_chk');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_acidity_0_10_chk');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_tannin_0_10_chk');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_body_0_10_chk');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_persistence_0_10_chk');

        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_intensity_aroma_0_5_chk CHECK (intensity_aroma BETWEEN 0 AND 5)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_sweetness_0_5_chk CHECK (sweetness BETWEEN 0 AND 5)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_acidity_0_5_chk CHECK (acidity BETWEEN 0 AND 5)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_tannin_0_5_chk CHECK (tannin IS NULL OR tannin BETWEEN 0 AND 5)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_body_0_5_chk CHECK (body BETWEEN 0 AND 5)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_persistence_0_5_chk CHECK (persistence BETWEEN 0 AND 5)');
    }
}
