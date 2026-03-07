<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260307110000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Rename do.logo_image to do.do_logo and add do.region_logo';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('ALTER TABLE "do" RENAME COLUMN logo_image TO do_logo');
        $this->addSql('ALTER TABLE "do" ADD region_logo VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('ALTER TABLE "do" DROP COLUMN region_logo');
        $this->addSql('ALTER TABLE "do" RENAME COLUMN do_logo TO logo_image');
    }
}
