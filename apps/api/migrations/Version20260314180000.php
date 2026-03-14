<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260314180000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Rename table do to designation_of_origin and align related constraint/index names';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('ALTER TABLE "do" RENAME TO designation_of_origin');
        $this->addSql('ALTER TABLE designation_of_origin RENAME CONSTRAINT ck_do_map_data_valid TO ck_designation_of_origin_map_data_valid');
        $this->addSql('ALTER TABLE designation_of_origin RENAME CONSTRAINT do_country_code_len_chk TO designation_of_origin_country_code_len_chk');
        $this->addSql('ALTER TABLE designation_of_origin RENAME CONSTRAINT do_country_code_upper_chk TO designation_of_origin_country_code_upper_chk');
        $this->addSql('ALTER TABLE designation_of_origin RENAME CONSTRAINT uniq_do_country_name TO uniq_designation_of_origin_country_name');
        $this->addSql('ALTER INDEX region_do_pkey RENAME TO designation_of_origin_pkey');
        $this->addSql('ALTER SEQUENCE region_do_id_seq RENAME TO designation_of_origin_id_seq');
        $this->addSql('ALTER TABLE wine RENAME CONSTRAINT wine_do_id_fkey TO wine_designation_of_origin_id_fkey');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('ALTER TABLE wine RENAME CONSTRAINT wine_designation_of_origin_id_fkey TO wine_do_id_fkey');
        $this->addSql('ALTER SEQUENCE designation_of_origin_id_seq RENAME TO region_do_id_seq');
        $this->addSql('ALTER INDEX designation_of_origin_pkey RENAME TO region_do_pkey');
        $this->addSql('ALTER TABLE designation_of_origin RENAME CONSTRAINT uniq_designation_of_origin_country_name TO uniq_do_country_name');
        $this->addSql('ALTER TABLE designation_of_origin RENAME CONSTRAINT designation_of_origin_country_code_upper_chk TO do_country_code_upper_chk');
        $this->addSql('ALTER TABLE designation_of_origin RENAME CONSTRAINT designation_of_origin_country_code_len_chk TO do_country_code_len_chk');
        $this->addSql('ALTER TABLE designation_of_origin RENAME CONSTRAINT ck_designation_of_origin_map_data_valid TO ck_do_map_data_valid');
        $this->addSql('ALTER TABLE designation_of_origin RENAME TO "do"');
    }
}
