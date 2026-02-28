<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260227174247 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Seed DO table with France appellations';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
INSERT INTO "do" (name, region, country, country_code)
VALUES
  ('Pauillac', 'Bordeaux', 'france'::country, 'FR'),
  ('Margaux', 'Bordeaux', 'france'::country, 'FR'),
  ('Saint-Émilion', 'Bordeaux', 'france'::country, 'FR'),
  ('Pomerol', 'Bordeaux', 'france'::country, 'FR'),
  ('Sauternes', 'Bordeaux', 'france'::country, 'FR'),
  ('Chablis', 'Bourgogne', 'france'::country, 'FR'),
  ('Gevrey-Chambertin', 'Bourgogne', 'france'::country, 'FR'),
  ('Meursault', 'Bourgogne', 'france'::country, 'FR'),
  ('Puligny-Montrachet', 'Bourgogne', 'france'::country, 'FR'),
  ('Champagne', 'Champagne', 'france'::country, 'FR'),
  ('Hermitage', 'Vallée du Rhône', 'france'::country, 'FR'),
  ('Côte-Rôtie', 'Vallée du Rhône', 'france'::country, 'FR'),
  ('Châteauneuf-du-Pape', 'Vallée du Rhône', 'france'::country, 'FR'),
  ('Gigondas', 'Vallée du Rhône', 'france'::country, 'FR'),
  ('Sancerre', 'Vallée du Loire', 'france'::country, 'FR'),
  ('Pouilly-Fumé', 'Vallée du Loire', 'france'::country, 'FR'),
  ('Chinon', 'Vallée du Loire', 'france'::country, 'FR'),
  ('Alsace Grand Cru', 'Alsace', 'france'::country, 'FR'),
  ('Côtes de Provence', 'Provence', 'france'::country, 'FR'),
  ('Bandol', 'Provence', 'france'::country, 'FR'),
  ('Minervois', 'Languedoc-Roussillon', 'france'::country, 'FR'),
  ('Corbières', 'Languedoc-Roussillon', 'france'::country, 'FR'),
  ('Morgon', 'Beaujolais', 'france'::country, 'FR'),
  ('Fleurie', 'Beaujolais', 'france'::country, 'FR'),
  ('Cahors', 'Sud-Ouest', 'france'::country, 'FR')
ON CONFLICT (country, name)
DO UPDATE SET
  region = EXCLUDED.region,
  country_code = EXCLUDED.country_code
SQL);
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
DELETE FROM "do"
WHERE country = 'france'::country
  AND name IN (
    'Pauillac', 'Margaux', 'Saint-Émilion', 'Pomerol', 'Sauternes',
    'Chablis', 'Gevrey-Chambertin', 'Meursault', 'Puligny-Montrachet', 'Champagne',
    'Hermitage', 'Côte-Rôtie', 'Châteauneuf-du-Pape', 'Gigondas', 'Sancerre',
    'Pouilly-Fumé', 'Chinon', 'Alsace Grand Cru', 'Côtes de Provence', 'Bandol',
    'Minervois', 'Corbières', 'Morgon', 'Fleurie', 'Cahors'
  )
SQL);
    }
}
