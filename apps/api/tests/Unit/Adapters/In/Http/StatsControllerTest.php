<?php

declare(strict_types=1);

namespace App\Tests\Unit\Adapters\In\Http;

use App\Adapters\In\Http\StatsController;
use App\Application\Ports\AuthSessionManager;
use App\Application\UseCases\Stats\GetGenericStats\GetGenericStatsHandler;
use App\Application\UseCases\Stats\GetReviewsPerMonth\GetReviewsPerMonthHandler;
use App\Application\UseCases\Stats\GetScoringGenericStats\GetScoringGenericStatsHandler;
use App\Domain\Model\GenericStats;
use App\Domain\Model\ReviewMonthStats;
use App\Domain\Model\ScoreBucketStat;
use App\Domain\Repository\ReviewStatsRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Response;

final class StatsControllerTest extends TestCase
{
    public function testGenericReturnsKpiPayload(): void
    {
        $controller = new StatsController(
            new GetReviewsPerMonthHandler(new InMemoryReviewStatsRepository()),
            new GetGenericStatsHandler(new SpyStatsAuthSessionManager(), new InMemoryReviewStatsRepository()),
            new GetScoringGenericStatsHandler(new InMemoryReviewStatsRepository()),
        );

        $response = $controller->generic();
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame(12, $payload['total_wines']);
        self::assertSame(44, $payload['total_reviews']);
        self::assertSame(5, $payload['my_reviews']);
        self::assertSame(86.3, $payload['average_red']);
        self::assertSame(84.8, $payload['average_white']);
    }

    public function testReviewsPerMonthReturnsChartPayload(): void
    {
        $controller = new StatsController(
            new GetReviewsPerMonthHandler(new InMemoryReviewStatsRepository()),
            new GetGenericStatsHandler(new SpyStatsAuthSessionManager(), new InMemoryReviewStatsRepository()),
            new GetScoringGenericStatsHandler(new InMemoryReviewStatsRepository()),
        );

        $response = $controller->reviewsPerMonth();
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame(['2025-11', '2025-12', '2026-01'], $payload['months']);
        self::assertSame([3, 0, 5], $payload['review_counts']);
        self::assertSame([91, null, 88.5], $payload['median_scores']);
    }

    public function testSocringGenericReturnsBucketPayload(): void
    {
        $controller = new StatsController(
            new GetReviewsPerMonthHandler(new InMemoryReviewStatsRepository()),
            new GetGenericStatsHandler(new SpyStatsAuthSessionManager(), new InMemoryReviewStatsRepository()),
            new GetScoringGenericStatsHandler(new InMemoryReviewStatsRepository()),
        );

        $response = $controller->socringGeneric();
        $payload = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame([
            ['label' => '90+', 'count' => 3],
            ['label' => '80-89', 'count' => 4],
            ['label' => '70-79', 'count' => 2],
            ['label' => '60-69', 'count' => 0],
            ['label' => '<60', 'count' => 0],
        ], $payload['items']);
    }
}

final class InMemoryReviewStatsRepository implements ReviewStatsRepository
{
    public function listReviewsPerMonth(): array
    {
        return [
            new ReviewMonthStats(new \DateTimeImmutable('2025-11-01T00:00:00+00:00'), 3, 91.0),
            new ReviewMonthStats(new \DateTimeImmutable('2025-12-01T00:00:00+00:00'), 0, null),
            new ReviewMonthStats(new \DateTimeImmutable('2026-01-01T00:00:00+00:00'), 5, 88.5),
        ];
    }

    public function getGenericStats(int $userId): GenericStats
    {
        return new GenericStats(12, 44, 5, 86.3, 84.8);
    }

    public function getScoringGenericStats(): array
    {
        return [
            new ScoreBucketStat('90+', 3),
            new ScoreBucketStat('80-89', 4),
            new ScoreBucketStat('70-79', 2),
            new ScoreBucketStat('60-69', 0),
            new ScoreBucketStat('<60', 0),
        ];
    }
}

final class SpyStatsAuthSessionManager implements AuthSessionManager
{
    public function loginByUserId(int $userId): void
    {
    }

    public function getAuthenticatedUserId(): ?int
    {
        return 1;
    }

    public function logout(): void
    {
    }
}
