<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260306140000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Rename Basque DO names to Getariako Txacolina and Arabako Txacolina';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
UPDATE "do"
SET name = CASE name
    WHEN 'Chacolí de Getaria – Getariako Txacolina' THEN 'Getariako Txacolina'
    WHEN 'Chacolí de Álava – Arabako Txacolina' THEN 'Arabako Txacolina'
    ELSE name
END
WHERE country = 'spain'::country
  AND region = 'País Vasco'
  AND name IN (
    'Chacolí de Getaria – Getariako Txacolina',
    'Chacolí de Álava – Arabako Txacolina'
  )
SQL);
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
UPDATE "do"
SET name = CASE name
    WHEN 'Getariako Txacolina' THEN 'Chacolí de Getaria – Getariako Txacolina'
    WHEN 'Arabako Txacolina' THEN 'Chacolí de Álava – Arabako Txacolina'
    ELSE name
END
WHERE country = 'spain'::country
  AND region = 'País Vasco'
  AND name IN ('Getariako Txacolina', 'Arabako Txacolina')
SQL);
    }
}
