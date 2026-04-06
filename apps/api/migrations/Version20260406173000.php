<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260406173000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Introduce place_country enum with world countries for purchase places.';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql("CREATE TYPE place_country AS ENUM ('afghanistan', 'albania', 'algeria', 'andorra', 'angola', 'anguilla', 'antigua_and_barbuda', 'argentina', 'armenia', 'australia', 'austria', 'azerbaijan', 'bahamas', 'bahrain', 'bangladesh', 'barbados', 'belarus', 'belgium', 'belize', 'benin', 'bhutan', 'bolivia', 'bosnia_and_herzegovina', 'botswana', 'brazil', 'brunei', 'bulgaria', 'burkina_faso', 'burundi', 'cambodia', 'cameroon', 'canada', 'cape_verde', 'central_african_republic', 'chad', 'chile', 'china', 'colombia', 'comoros', 'congo_brazzaville', 'congo_kinshasa', 'costa_rica', 'cote_d_ivoire', 'croatia', 'cuba', 'cyprus', 'czechia', 'denmark', 'djibouti', 'dominica', 'dominican_republic', 'ecuador', 'egypt', 'el_salvador', 'equatorial_guinea', 'eritrea', 'estonia', 'eswatini', 'ethiopia', 'fiji', 'finland', 'france', 'gabon', 'gambia', 'georgia', 'germany', 'ghana', 'greece', 'grenada', 'guatemala', 'guinea', 'guinea_bissau', 'guyana', 'haiti', 'honduras', 'hungary', 'iceland', 'india', 'indonesia', 'iran', 'iraq', 'ireland', 'israel', 'italy', 'jamaica', 'japan', 'jordan', 'kazakhstan', 'kenya', 'kiribati', 'kuwait', 'kyrgyzstan', 'laos', 'latvia', 'lebanon', 'lesotho', 'liberia', 'libya', 'liechtenstein', 'lithuania', 'luxembourg', 'madagascar', 'malawi', 'malaysia', 'maldives', 'mali', 'malta', 'marshall_islands', 'mauritania', 'mauritius', 'mexico', 'micronesia', 'moldova', 'monaco', 'mongolia', 'montenegro', 'morocco', 'mozambique', 'myanmar_burma', 'namibia', 'nauru', 'nepal', 'netherlands', 'new_zealand', 'nicaragua', 'niger', 'nigeria', 'north_korea', 'north_macedonia', 'norway', 'oman', 'pakistan', 'palau', 'panama', 'papua_new_guinea', 'paraguay', 'peru', 'philippines', 'poland', 'portugal', 'qatar', 'romania', 'russia', 'rwanda', 'samoa', 'san_marino', 'sao_tome_and_principe', 'saudi_arabia', 'senegal', 'serbia', 'seychelles', 'sierra_leone', 'singapore', 'slovakia', 'slovenia', 'solomon_islands', 'somalia', 'south_africa', 'south_korea', 'south_sudan', 'spain', 'sri_lanka', 'st_kitts_and_nevis', 'st_lucia', 'st_vincent_and_grenadines', 'sudan', 'suriname', 'sweden', 'switzerland', 'syria', 'tajikistan', 'tanzania', 'thailand', 'timor_leste', 'togo', 'tonga', 'trinidad_and_tobago', 'tunisia', 'turkiye', 'turkmenistan', 'tuvalu', 'uganda', 'ukraine', 'united_arab_emirates', 'united_kingdom', 'united_states', 'uruguay', 'uzbekistan', 'vanuatu', 'vatican_city', 'venezuela', 'vietnam', 'yemen', 'zambia', 'zimbabwe')");
        $this->addSql('ALTER TABLE place ALTER COLUMN country TYPE place_country USING country::text::place_country');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Migration can only be executed safely on PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
ALTER TABLE place
ALTER COLUMN country TYPE country
USING (
    CASE
        WHEN country::text IN ('spain', 'france', 'italy', 'portugal', 'germany', 'argentina', 'chile', 'united_states', 'south_africa', 'australia')
            THEN country::text::country
        ELSE 'spain'::country
    END
)
SQL);
        $this->addSql('DROP TYPE place_country');
    }
}
