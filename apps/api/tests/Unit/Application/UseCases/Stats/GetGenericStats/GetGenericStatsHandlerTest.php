<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Stats\GetGenericStats;

use App\Application\Ports\AuthSessionManager;
use App\Application\UseCases\Stats\GetGenericStats\GetGenericStatsHandler;
use App\Application\UseCases\Stats\GetGenericStats\GetGenericStatsUnauthenticated;
use App\Domain\Model\GenericStats;
use App\Domain\Model\ReviewMonthStats;
use App\Domain\Repository\ReviewStatsRepository;
use PHPUnit\Framework\TestCase;

final class GetGenericStatsHandlerTest extends TestCase
{
    public function testItReturnsGenericStatsForAuthenticatedUser(): void
    {
        $session = new SpyStatsSessionManager();
        $session->authenticatedUserId = 7;
        $handler = new GetGenericStatsHandler($session, new InMemoryStatsRepository());

        $result = $handler->handle();

        self::assertSame(10, $result->totalWines);
        self::assertSame(44, $result->totalReviews);
        self::assertSame(6, $result->myReviews);
        self::assertSame(86.4, $result->averageRed);
        self::assertSame(84.1, $result->averageWhite);
    }

    public function testItRejectsUnauthenticatedRequests(): void
    {
        $handler = new GetGenericStatsHandler(new SpyStatsSessionManager(), new InMemoryStatsRepository());

        $this->expectException(GetGenericStatsUnauthenticated::class);
        $handler->handle();
    }
}

final class SpyStatsSessionManager implements AuthSessionManager
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

final class InMemoryStatsRepository implements ReviewStatsRepository
{
    public function listReviewsPerMonth(): array
    {
        return [
            new ReviewMonthStats(new \DateTimeImmutable('2025-11-01T00:00:00+00:00'), 3, 91.0),
        ];
    }

    public function getGenericStats(int $userId): GenericStats
    {
        return new GenericStats(10, 44, 6, 86.4, 84.1);
    }
}
