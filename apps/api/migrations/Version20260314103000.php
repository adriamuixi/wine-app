<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260314103000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add do.map_data JSONB column for map coordinates and optional zoom';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('ALTER TABLE "do" ADD COLUMN map_data JSONB DEFAULT NULL');
        $this->addSql(<<<'SQL'
ALTER TABLE "do"
ADD CONSTRAINT ck_do_map_data_valid
CHECK (
    map_data IS NULL
    OR (
        jsonb_typeof(map_data) = 'object'
        AND jsonb_exists(map_data, 'lat')
        AND jsonb_exists(map_data, 'lng')
        AND jsonb_typeof(map_data->'lat') = 'number'
        AND jsonb_typeof(map_data->'lng') = 'number'
        AND ((map_data->>'lat')::double precision BETWEEN -90 AND 90)
        AND ((map_data->>'lng')::double precision BETWEEN -180 AND 180)
        AND (
            NOT jsonb_exists(map_data, 'zoom')
            OR (
                jsonb_typeof(map_data->'zoom') = 'number'
                AND ((map_data->>'zoom')::int BETWEEN 1 AND 18)
            )
        )
    )
)
SQL);
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('ALTER TABLE "do" DROP CONSTRAINT ck_do_map_data_valid');
        $this->addSql('ALTER TABLE "do" DROP COLUMN map_data');
    }
}
