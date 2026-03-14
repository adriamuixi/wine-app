<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260314213000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Refactor review scoring axes to 5 fields and shrink review_bullet enum values.';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'review' AND column_name = 'intensity_aroma'
    ) THEN
        ALTER TABLE review RENAME COLUMN intensity_aroma TO aroma;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'review' AND column_name = 'sweetness'
    ) THEN
        ALTER TABLE review RENAME COLUMN sweetness TO appearance;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'review' AND column_name = 'acidity'
    ) THEN
        ALTER TABLE review RENAME COLUMN acidity TO palate_entry;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'review' AND column_name = 'tannin'
    ) THEN
        ALTER TABLE review DROP COLUMN tannin;
    END IF;
END
$$;
SQL);

        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_aroma_0_10_chk');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_appearance_0_10_chk');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_palate_entry_0_10_chk');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_body_0_10_chk');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_persistence_0_10_chk');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_intensity_aroma_0_10_chk');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_sweetness_0_10_chk');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_acidity_0_10_chk');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_body_check');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_persistence_check');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_intensity_aroma_check');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_sweetness_check');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_acidity_check');

        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_aroma_0_10_chk CHECK (aroma BETWEEN 0 AND 10)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_appearance_0_10_chk CHECK (appearance BETWEEN 0 AND 10)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_palate_entry_0_10_chk CHECK (palate_entry BETWEEN 0 AND 10)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_body_0_10_chk CHECK (body BETWEEN 0 AND 10)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_persistence_0_10_chk CHECK (persistence BETWEEN 0 AND 10)');

        $this->addSql("ALTER TYPE review_bullet RENAME TO review_bullet_old");
        $this->addSql("CREATE TYPE review_bullet AS ENUM ('fruity', 'floral', 'mineral', 'oak_forward', 'powerful')");
        $this->addSql(<<<'SQL'
ALTER TABLE review_bullets
ALTER COLUMN bullet TYPE review_bullet
USING (
    CASE bullet::text
        WHEN 'spicy' THEN 'powerful'
        WHEN 'easy_drinking' THEN 'fruity'
        WHEN 'elegant' THEN 'floral'
        WHEN 'food_friendly' THEN 'mineral'
        ELSE bullet::text
    END
)::review_bullet
SQL);
        $this->addSql('DROP TYPE review_bullet_old');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql("ALTER TYPE review_bullet RENAME TO review_bullet_new");
        $this->addSql("CREATE TYPE review_bullet AS ENUM ('fruity', 'floral', 'spicy', 'mineral', 'oak_forward', 'easy_drinking', 'elegant', 'powerful', 'food_friendly')");
        $this->addSql(<<<'SQL'
ALTER TABLE review_bullets
ALTER COLUMN bullet TYPE review_bullet
USING (
    CASE bullet::text
        WHEN 'powerful' THEN 'spicy'
        WHEN 'fruity' THEN 'easy_drinking'
        WHEN 'floral' THEN 'elegant'
        WHEN 'mineral' THEN 'food_friendly'
        ELSE bullet::text
    END
)::review_bullet
SQL);
        $this->addSql('DROP TYPE review_bullet_new');

        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_aroma_0_10_chk');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_appearance_0_10_chk');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_palate_entry_0_10_chk');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_body_0_10_chk');
        $this->addSql('ALTER TABLE review DROP CONSTRAINT IF EXISTS review_persistence_0_10_chk');

        $this->addSql('ALTER TABLE review ADD COLUMN tannin SMALLINT NULL');

        $this->addSql(<<<'SQL'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'review' AND column_name = 'palate_entry'
    ) THEN
        ALTER TABLE review RENAME COLUMN palate_entry TO acidity;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'review' AND column_name = 'appearance'
    ) THEN
        ALTER TABLE review RENAME COLUMN appearance TO sweetness;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'review' AND column_name = 'aroma'
    ) THEN
        ALTER TABLE review RENAME COLUMN aroma TO intensity_aroma;
    END IF;
END
$$;
SQL);

        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_intensity_aroma_0_10_chk CHECK (intensity_aroma BETWEEN 0 AND 10)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_sweetness_0_10_chk CHECK (sweetness BETWEEN 0 AND 10)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_acidity_0_10_chk CHECK (acidity BETWEEN 0 AND 10)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_tannin_0_10_chk CHECK (tannin IS NULL OR tannin BETWEEN 0 AND 10)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_body_0_10_chk CHECK (body BETWEEN 0 AND 10)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT review_persistence_0_10_chk CHECK (persistence BETWEEN 0 AND 10)');
    }
}
