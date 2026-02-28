<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260227164740 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Rename region_do to do and add region/country_code columns';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('ALTER TABLE region_do RENAME TO "do"');
        $this->addSql('ALTER TABLE "do" RENAME CONSTRAINT region_do_country_name_key TO uniq_do_country_name');

        $this->addSql('ALTER TABLE "do" ADD COLUMN region VARCHAR(255)');
        $this->addSql('ALTER TABLE "do" ADD COLUMN country_code VARCHAR(2)');

        $this->addSql('UPDATE "do" SET region = name WHERE region IS NULL');
        $this->addSql(<<<'SQL'
UPDATE "do"
SET country_code = CASE country::text
    WHEN 'spain' THEN 'es'
    WHEN 'france' THEN 'fr'
    WHEN 'italy' THEN 'it'
    WHEN 'portugal' THEN 'pt'
    WHEN 'germany' THEN 'de'
    WHEN 'argentina' THEN 'ar'
    WHEN 'chile' THEN 'cl'
    WHEN 'united_states' THEN 'us'
    WHEN 'south_africa' THEN 'za'
    WHEN 'australia' THEN 'au'
END
WHERE country_code IS NULL
SQL);

        $this->addSql('ALTER TABLE "do" ALTER COLUMN region SET NOT NULL');
        $this->addSql('ALTER TABLE "do" ALTER COLUMN country_code SET NOT NULL');
        $this->addSql('ALTER TABLE "do" ADD CONSTRAINT do_country_code_lower_chk CHECK (country_code = lower(country_code))');
        $this->addSql('ALTER TABLE "do" ADD CONSTRAINT do_country_code_len_chk CHECK (char_length(country_code) = 2)');

        $this->addSql('ALTER TABLE wine RENAME COLUMN region_do_id TO do_id');
        $this->addSql('ALTER TABLE wine RENAME CONSTRAINT wine_region_do_id_fkey TO wine_do_id_fkey');
        $this->addSql('ALTER INDEX wine_country_region_idx RENAME TO wine_country_do_idx');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('ALTER TABLE wine RENAME COLUMN do_id TO region_do_id');
        $this->addSql('ALTER TABLE wine RENAME CONSTRAINT wine_do_id_fkey TO wine_region_do_id_fkey');
        $this->addSql('ALTER INDEX wine_country_do_idx RENAME TO wine_country_region_idx');

        $this->addSql('ALTER TABLE "do" DROP CONSTRAINT do_country_code_len_chk');
        $this->addSql('ALTER TABLE "do" DROP CONSTRAINT do_country_code_lower_chk');
        $this->addSql('ALTER TABLE "do" DROP COLUMN country_code');
        $this->addSql('ALTER TABLE "do" DROP COLUMN region');

        $this->addSql('ALTER TABLE "do" RENAME CONSTRAINT uniq_do_country_name TO region_do_country_name_key');
        $this->addSql('ALTER TABLE "do" RENAME TO region_do');
    }
}
