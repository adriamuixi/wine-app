<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCases\Stats\GetScoringGenericStats;

use App\Application\UseCases\Stats\GetScoringGenericStats\GetScoringGenericStatsHandler;
use App\Domain\Model\GenericStats;
use App\Domain\Model\ReviewMonthStats;
use App\Domain\Model\ScoreBucketStat;
use App\Domain\Repository\ReviewStatsRepository;
use PHPUnit\Framework\TestCase;

final class GetScoringGenericStatsHandlerTest extends TestCase
{
    public function testItReturnsOrderedScoreBuckets(): void
    {
        $handler = new GetScoringGenericStatsHandler(new InMemoryScoringStatsRepository());

        $result = $handler->handle();

        self::assertSame([
            ['label' => '90+', 'count' => 3],
            ['label' => '80-89', 'count' => 4],
            ['label' => '70-79', 'count' => 2],
            ['label' => '60-69', 'count' => 1],
            ['label' => '<60', 'count' => 0],
        ], $result->items);
    }
}

final class InMemoryScoringStatsRepository implements ReviewStatsRepository
{
    public function listReviewsPerMonth(): array
    {
        return [
            new ReviewMonthStats(new \DateTimeImmutable('2025-11-01T00:00:00+00:00'), 3, 91.0),
        ];
    }

    public function getGenericStats(int $userId): GenericStats
    {
        return new GenericStats(0, 0, 0, 0.0, 0.0);
    }

    public function getScoringGenericStats(): array
    {
        return [
            new ScoreBucketStat('90+', 3),
            new ScoreBucketStat('80-89', 4),
            new ScoreBucketStat('70-79', 2),
            new ScoreBucketStat('60-69', 1),
            new ScoreBucketStat('<60', 0),
        ];
    }
}
