<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260303130000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Drop legacy review 0..5 check constraints kept after 0..10 migration';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_intensity_aroma_check');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_sweetness_check');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_acidity_check');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_tannin_check');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_body_check');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_persistence_check');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_intensity_aroma_check CHECK (intensity_aroma BETWEEN 0 AND 5)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_sweetness_check CHECK (sweetness BETWEEN 0 AND 5)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_acidity_check CHECK (acidity BETWEEN 0 AND 5)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_tannin_check CHECK (tannin IS NULL OR tannin BETWEEN 0 AND 5)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_body_check CHECK (body BETWEEN 0 AND 5)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_persistence_check CHECK (persistence BETWEEN 0 AND 5)');
    }
}
