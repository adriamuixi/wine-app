<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Stats\GetCatalogHealthStats;

use App\Application\UseCases\Stats\GetCatalogHealthStats\GetCatalogHealthStatsHandler;
use App\Domain\Model\Stats\ActivityStats;
use App\Domain\Model\Stats\CatalogHealthStats;
use App\Domain\Model\Stats\CoverageStats;
use App\Domain\Model\Stats\PairAgreementStats;
use App\Domain\Model\Stats\ScoreDistributionStats;
use App\Domain\Model\Stats\ValueStats;
use App\Domain\Repository\StatsRepository;
use PHPUnit\Framework\TestCase;

final class GetCatalogHealthStatsHandlerTest extends TestCase
{
    public function testItReturnsCatalogCoverageAndCompletenessIndicators(): void
    {
        $handler = new GetCatalogHealthStatsHandler(new InMemoryCatalogHealthStatsRepository());

        $result = $handler->handle();

        self::assertSame(47, $result->winesWithoutReviews);
        self::assertSame(4, $result->winesWithoutPhotos);
        self::assertSame(2, $result->winesWithAwards);
        self::assertSame(74, $result->winesWithoutAwards);
        self::assertSame(94.7, $result->photoCoveragePct);
        self::assertSame(100.0, $result->grapeCoveragePct);
        self::assertSame(38.2, $result->reviewCoveragePct);
        self::assertSame(56.4, $result->doLogoCoveragePct);
        self::assertSame(52.0, $result->regionLogoCoveragePct);
        self::assertSame(100.0, $result->doMapCoveragePct);
        self::assertSame(82.5, $result->placesWithMapPct);
    }
}

final class InMemoryCatalogHealthStatsRepository implements StatsRepository
{
    public function getCoverageStats(int $userId): CoverageStats
    {
        throw new \LogicException('Not needed in this test.');
    }

    public function getActivityStats(): ActivityStats
    {
        throw new \LogicException('Not needed in this test.');
    }

    public function getScoreDistributionStats(): ScoreDistributionStats
    {
        throw new \LogicException('Not needed in this test.');
    }

    public function getValueStats(): ValueStats
    {
        throw new \LogicException('Not needed in this test.');
    }

    public function getCatalogHealthStats(): CatalogHealthStats
    {
        return new CatalogHealthStats(
            winesWithoutReviews: 47,
            winesWithoutPhotos: 4,
            winesWithAwards: 2,
            winesWithoutAwards: 74,
            photoCoveragePct: 94.7,
            grapeCoveragePct: 100.0,
            reviewCoveragePct: 38.2,
            doLogoCoveragePct: 56.4,
            regionLogoCoveragePct: 52.0,
            doMapCoveragePct: 100.0,
            placesWithMapPct: 82.5,
        );
    }

    public function getPairAgreementStats(): PairAgreementStats
    {
        throw new \LogicException('Not needed in this test.');
    }
}
