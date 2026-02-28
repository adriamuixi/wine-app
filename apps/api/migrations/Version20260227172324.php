<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260227172324 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Seed DO table from CSV (Spain denominations) and enforce uppercase country_code';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql('ALTER TABLE "do" DROP CONSTRAINT IF EXISTS do_country_code_lower_chk');
        $this->addSql('UPDATE "do" SET country_code = upper(country_code)');
        $this->addSql('ALTER TABLE "do" ADD CONSTRAINT do_country_code_upper_chk CHECK (country_code = upper(country_code))');

        $this->addSql(<<<'SQL'
INSERT INTO "do" (name, region, country, country_code)
VALUES
            ('Jumilla', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('Rioja', 'La Rioja', 'spain'::country, 'ES'),
            ('Condado de Huelva', 'Andalucía', 'spain'::country, 'ES'),
            ('Granada', 'Andalucía', 'spain'::country, 'ES'),
            ('Jerez-Xérès-Sherry', 'Andalucía', 'spain'::country, 'ES'),
            ('Lebrija', 'Andalucía', 'spain'::country, 'ES'),
            ('Málaga', 'Andalucía', 'spain'::country, 'ES'),
            ('Manzanilla Sanlúcar de Barrameda', 'Andalucía', 'spain'::country, 'ES'),
            ('Montilla-Moriles', 'Andalucía', 'spain'::country, 'ES'),
            ('Sierras de Málaga', 'Andalucía', 'spain'::country, 'ES'),
            ('Aylés', 'Aragón', 'spain'::country, 'ES'),
            ('Calatayud', 'Aragón', 'spain'::country, 'ES'),
            ('Campo de Borja', 'Aragón', 'spain'::country, 'ES'),
            ('Cariñena', 'Aragón', 'spain'::country, 'ES'),
            ('Somontano', 'Aragón', 'spain'::country, 'ES'),
            ('Urbezo', 'Aragón', 'spain'::country, 'ES'),
            ('Cangas', 'Asturias', 'spain'::country, 'ES'),
            ('Abona', 'Canarias', 'spain'::country, 'ES'),
            ('El Hierro', 'Canarias', 'spain'::country, 'ES'),
            ('Gran Canaria', 'Canarias', 'spain'::country, 'ES'),
            ('Islas Canarias', 'Canarias', 'spain'::country, 'ES'),
            ('La Gomera', 'Canarias', 'spain'::country, 'ES'),
            ('La Palma', 'Canarias', 'spain'::country, 'ES'),
            ('Lanzarote', 'Canarias', 'spain'::country, 'ES'),
            ('Tacoronte-Acentejo', 'Canarias', 'spain'::country, 'ES'),
            ('Valle de Güimar', 'Canarias', 'spain'::country, 'ES'),
            ('Valle de la Orotava', 'Canarias', 'spain'::country, 'ES'),
            ('Ycoden-Daute-Isora', 'Canarias', 'spain'::country, 'ES'),
            ('Almansa', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('Campo de Calatrava', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('Campo de la Guardia', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('Casa del Blanco', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('Dehesa del Carrizal', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('Dominio de Valdepusa', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('El Vicario', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('Finca Élez', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('Guijoso', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('La Jaraba', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('La Mancha', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('Los Cerrillos', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('Manchuela', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('Méntrida', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('Mondéjar', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('Pago Calzadilla', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('Pago Florentino', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('Ribera del Júcar', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('Río Negro', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('Rosalejo', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('Tharsys', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('Uclés', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('Valdepeñas', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('Vallegarcía', 'Castilla-La Mancha', 'spain'::country, 'ES'),
            ('Abadía Retuerta', 'Castilla y León', 'spain'::country, 'ES'),
            ('Arlanza', 'Castilla y León', 'spain'::country, 'ES'),
            ('Arribes', 'Castilla y León', 'spain'::country, 'ES'),
            ('Bierzo', 'Castilla y León', 'spain'::country, 'ES'),
            ('Cebreros', 'Castilla y León', 'spain'::country, 'ES'),
            ('Cigales', 'Castilla y León', 'spain'::country, 'ES'),
            ('Dehesa Peñalba', 'Castilla y León', 'spain'::country, 'ES'),
            ('Heredad de Urueña', 'Castilla y León', 'spain'::country, 'ES'),
            ('León', 'Castilla y León', 'spain'::country, 'ES'),
            ('Ribera del Duero', 'Castilla y León', 'spain'::country, 'ES'),
            ('Rueda', 'Castilla y León', 'spain'::country, 'ES'),
            ('Sierra de Salamanca', 'Castilla y León', 'spain'::country, 'ES'),
            ('Tierra del Vino de Zamora', 'Castilla y León', 'spain'::country, 'ES'),
            ('Toro', 'Castilla y León', 'spain'::country, 'ES'),
            ('Valles de Benavente', 'Castilla y León', 'spain'::country, 'ES'),
            ('Valtiendas', 'Castilla y León', 'spain'::country, 'ES'),
            ('Alella', 'Cataluña', 'spain'::country, 'ES'),
            ('Cataluña', 'Cataluña', 'spain'::country, 'ES'),
            ('Conca de Barberà', 'Cataluña', 'spain'::country, 'ES'),
            ('Costers del Segre', 'Cataluña', 'spain'::country, 'ES'),
            ('Empordà', 'Cataluña', 'spain'::country, 'ES'),
            ('Montsant', 'Cataluña', 'spain'::country, 'ES'),
            ('Penedés', 'Cataluña', 'spain'::country, 'ES'),
            ('Pla de Bages', 'Cataluña', 'spain'::country, 'ES'),
            ('Priorat', 'Cataluña', 'spain'::country, 'ES'),
            ('Tarragona', 'Cataluña', 'spain'::country, 'ES'),
            ('Terra Alta', 'Cataluña', 'spain'::country, 'ES'),
            ('Ribera del Guadiana', 'Extremadura', 'spain'::country, 'ES'),
            ('Monterrei', 'Galicia', 'spain'::country, 'ES'),
            ('Rias Baixas', 'Galicia', 'spain'::country, 'ES'),
            ('Ribeira Sacra', 'Galicia', 'spain'::country, 'ES'),
            ('Ribeiro', 'Galicia', 'spain'::country, 'ES'),
            ('Valdeorras', 'Galicia', 'spain'::country, 'ES'),
            ('Binissalem', 'Islas Baleares', 'spain'::country, 'ES'),
            ('Pla i Llevant', 'Islas Baleares', 'spain'::country, 'ES'),
            ('Vinos de Madrid', 'Madrid', 'spain'::country, 'ES'),
            ('Bullas', 'Murcia', 'spain'::country, 'ES'),
            ('Yecla', 'Murcia', 'spain'::country, 'ES'),
            ('Navarra', 'Navarra', 'spain'::country, 'ES'),
            ('Pago de Arínzano', 'Navarra', 'spain'::country, 'ES'),
            ('Pago de Otazu', 'Navarra', 'spain'::country, 'ES'),
            ('Prado de Irache', 'Navarra', 'spain'::country, 'ES'),
            ('Pago Finca Bolandín', 'Navarra', 'spain'::country, 'ES'),
            ('Chacolí de Álava – Arabako Txacolina', 'País Vasco', 'spain'::country, 'ES'),
            ('Chacolí de Bizkaia – Bizkaiko Txacolina', 'País Vasco', 'spain'::country, 'ES'),
            ('Chacolí de Getaria – Getariako Txacolina', 'País Vasco', 'spain'::country, 'ES'),
            ('Alicante', 'Comunidad Valenciana', 'spain'::country, 'ES'),
            ('El Terrerazo', 'Comunidad Valenciana', 'spain'::country, 'ES'),
            ('Los Balagueses', 'Comunidad Valenciana', 'spain'::country, 'ES'),
            ('Utiel-Requena', 'Comunidad Valenciana', 'spain'::country, 'ES'),
            ('Valencia', 'Comunidad Valenciana', 'spain'::country, 'ES'),
            ('Vera de Estenas', 'Comunidad Valenciana', 'spain'::country, 'ES'),
            ('Chozas Carrascal', 'Comunidad Valenciana', 'spain'::country, 'ES')
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
WHERE country = 'spain'::country
  AND name IN ('Jumilla', 'Rioja', 'Condado de Huelva', 'Granada', 'Jerez-Xérès-Sherry', 'Lebrija', 'Málaga', 'Manzanilla Sanlúcar de Barrameda', 'Montilla-Moriles', 'Sierras de Málaga', 'Aylés', 'Calatayud', 'Campo de Borja', 'Cariñena', 'Somontano', 'Urbezo', 'Cangas', 'Abona', 'El Hierro', 'Gran Canaria', 'Islas Canarias', 'La Gomera', 'La Palma', 'Lanzarote', 'Tacoronte-Acentejo', 'Valle de Güimar', 'Valle de la Orotava', 'Ycoden-Daute-Isora', 'Almansa', 'Campo de Calatrava', 'Campo de la Guardia', 'Casa del Blanco', 'Dehesa del Carrizal', 'Dominio de Valdepusa', 'El Vicario', 'Finca Élez', 'Guijoso', 'La Jaraba', 'La Mancha', 'Los Cerrillos', 'Manchuela', 'Méntrida', 'Mondéjar', 'Pago Calzadilla', 'Pago Florentino', 'Ribera del Júcar', 'Río Negro', 'Rosalejo', 'Tharsys', 'Uclés', 'Valdepeñas', 'Vallegarcía', 'Abadía Retuerta', 'Arlanza', 'Arribes', 'Bierzo', 'Cebreros', 'Cigales', 'Dehesa Peñalba', 'Heredad de Urueña', 'León', 'Ribera del Duero', 'Rueda', 'Sierra de Salamanca', 'Tierra del Vino de Zamora', 'Toro', 'Valles de Benavente', 'Valtiendas', 'Alella', 'Cataluña', 'Conca de Barberà', 'Costers del Segre', 'Empordà', 'Montsant', 'Penedés', 'Pla de Bages', 'Priorat', 'Tarragona', 'Terra Alta', 'Ribera del Guadiana', 'Monterrei', 'Rias Baixas', 'Ribeira Sacra', 'Ribeiro', 'Valdeorras', 'Binissalem', 'Pla i Llevant', 'Vinos de Madrid', 'Bullas', 'Yecla', 'Navarra', 'Pago de Arínzano', 'Pago de Otazu', 'Prado de Irache', 'Pago Finca Bolandín', 'Chacolí de Álava – Arabako Txacolina', 'Chacolí de Bizkaia – Bizkaiko Txacolina', 'Chacolí de Getaria – Getariako Txacolina', 'Alicante', 'El Terrerazo', 'Los Balagueses', 'Utiel-Requena', 'Valencia', 'Vera de Estenas', 'Chozas Carrascal')
SQL);

        $this->addSql('ALTER TABLE "do" DROP CONSTRAINT IF EXISTS do_country_code_upper_chk');
        $this->addSql('UPDATE "do" SET country_code = lower(country_code)');
        $this->addSql('ALTER TABLE "do" ADD CONSTRAINT do_country_code_lower_chk CHECK (country_code = lower(country_code))');
    }
}
