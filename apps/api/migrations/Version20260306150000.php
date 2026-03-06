<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260306150000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Populate do.logo_image for rows whose current icon filename matches the normalized DO name';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
UPDATE "do" AS d
SET logo_image = v.logo_image
FROM (
  VALUES
    ('Arabako Txacolina', 'arabako_txacolina_DO.jpg'),
    ('Bierzo', 'bierzo_DO.jpg'),
    ('Binissalem', 'binissalem_DO.png'),
    ('Bizkaiko Txacolina', 'bizkaiko_txacolina_DO.png'),
    ('Bullas', 'bullas_DO.jpg'),
    ('Cebreros', 'cebreros_DO.png'),
    ('Chozas Carrascal', 'chozas_carrascal_DO.png'),
    ('Dehesa Peñalba', 'dehesa_penalba_DO.jpg'),
    ('El Terrerazo', 'el_terrerazo_DO.jpg'),
    ('Getariako Txacolina', 'getariako_txacolina_DO.jpg'),
    ('Heredad de Urueña', 'heredad_de_urueña_DO.jpg'),
    ('León', 'leon_DO.png'),
    ('Los Balagueses', 'los_balagueses_DO.jpg'),
    ('Manchuela', 'manchuela_DO.jpg'),
    ('Méntrida', 'mentrida_DO.png'),
    ('Monterrei', 'monterrei_DO.png'),
    ('Pago Calzadilla', 'pago_calzadilla_DO.png'),
    ('Pago Florentino', 'pago_florentino_DO.jpg'),
    ('Pago de Arínzano', 'pago_de_arínzano_DO.png'),
    ('Pago de Otazu', 'pago_de_otazu_DO.jpg'),
    ('Pla i Llevant', 'pla_i_llevant_DO.jpg'),
    ('Prado de Irache', 'prado_de_irache_DO.jpg'),
    ('Ribera del Guadiana', 'ribera_del_guadiana_DO.jpeg'),
    ('Ribera del Júcar', 'ribera_del_jucar_DO.png'),
    ('Ribeira Sacra', 'ribeira_sacra_DO.png'),
    ('Ribeiro', 'ribeiro_DO.jpg'),
    ('Rueda', 'rueda_DO.png'),
    ('Río Negro', 'rio_negro_DO.png'),
    ('Sierra de Salamanca', 'sierra_de_salamanca_DO.png'),
    ('Tharsys', 'tharsys_DO.jpg'),
    ('Tierra del Vino de Zamora', 'tierra_del_vino_de_zamora_DO.jpg'),
    ('Uclés', 'ucles_DO.png'),
    ('Valdeorras', 'valdeorras_DO.jpg'),
    ('Valencia', 'valencia_DO.jpg'),
    ('Vallegarcía', 'vallegarcia_DO.jpg'),
    ('Vera de Estenas', 'vera_de_estenas_DO.jpg'),
    ('Vinos de Madrid', 'vinos_de_madrid_DO.jpg')
) AS v(name, logo_image)
WHERE d.name = v.name
  AND d.logo_image IS DISTINCT FROM v.logo_image
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
SET logo_image = NULL
WHERE name IN (
    'Arabako Txacolina',
    'Bierzo',
    'Binissalem',
    'Bizkaiko Txacolina',
    'Bullas',
    'Cebreros',
    'Chozas Carrascal',
    'Dehesa Peñalba',
    'El Terrerazo',
    'Getariako Txacolina',
    'Heredad de Urueña',
    'León',
    'Los Balagueses',
    'Manchuela',
    'Méntrida',
    'Monterrei',
    'Pago Calzadilla',
    'Pago Florentino',
    'Pago de Arínzano',
    'Pago de Otazu',
    'Pla i Llevant',
    'Prado de Irache',
    'Ribera del Guadiana',
    'Ribera del Júcar',
    'Ribeira Sacra',
    'Ribeiro',
    'Rueda',
    'Río Negro',
    'Sierra de Salamanca',
    'Tharsys',
    'Tierra del Vino de Zamora',
    'Uclés',
    'Valdeorras',
    'Valencia',
    'Vallegarcía',
    'Vera de Estenas',
    'Vinos de Madrid'
)
SQL);
    }
}
