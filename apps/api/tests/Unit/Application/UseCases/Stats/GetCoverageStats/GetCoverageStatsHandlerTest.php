<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Stats\GetCoverageStats;

use App\Application\Ports\AuthSessionManager;
use App\Application\UseCases\Stats\GetCoverageStats\GetCoverageStatsHandler;
use App\Application\UseCases\Stats\GetCoverageStats\GetCoverageStatsUnauthenticated;
use App\Domain\Model\Stats\ActivityStats;
use App\Domain\Model\Stats\CatalogHealthStats;
use App\Domain\Model\Stats\CoverageStats;
use App\Domain\Model\Stats\PairAgreementStats;
use App\Domain\Model\Stats\ScoreDistributionStats;
use App\Domain\Model\Stats\ValueStats;
use App\Domain\Repository\StatsRepository;
use PHPUnit\Framework\TestCase;

final class GetCoverageStatsHandlerTest extends TestCase
{
    public function testItReturnsCoverageStatsForAuthenticatedUser(): void
    {
        $session = new SpyCoverageSessionManager();
        $session->authenticatedUserId = 7;
        $handler = new GetCoverageStatsHandler($session, new InMemoryCoverageStatsRepository());

        $result = $handler->handle();

        self::assertSame(76, $result->totalWines);
        self::assertSame(29, $result->reviewedWines);
        self::assertSame(54, $result->totalReviews);
        self::assertSame(38.2, $result->reviewCoveragePct);
        self::assertSame(71.5, $result->avgScore);
        self::assertSame(71.0, $result->medianScore);
        self::assertSame(27, $result->myReviews);
        self::assertSame(2, $result->usersWithReviews);
    }

    public function testItRejectsUnauthenticatedRequests(): void
    {
        $handler = new GetCoverageStatsHandler(new SpyCoverageSessionManager(), new InMemoryCoverageStatsRepository());

        $this->expectException(GetCoverageStatsUnauthenticated::class);
        $handler->handle();
    }
}

final class SpyCoverageSessionManager implements AuthSessionManager
{
    public ?int $authenticatedUserId = null;

    public function loginByUserId(int $userId): void
    {
    }

    public function getAuthenticatedUserId(): ?int
    {
        return $this->authenticatedUserId;
    }

    public function logout(): void
    {
    }
}

final class InMemoryCoverageStatsRepository implements StatsRepository
{
    public function getCoverageStats(int $userId): CoverageStats
    {
        return new CoverageStats(76, 29, 54, 38.2, 71.5, 71.0, 27, 2);
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
        throw new \LogicException('Not needed in this test.');
    }

    public function getPairAgreementStats(): PairAgreementStats
    {
        throw new \LogicException('Not needed in this test.');
    }
}
