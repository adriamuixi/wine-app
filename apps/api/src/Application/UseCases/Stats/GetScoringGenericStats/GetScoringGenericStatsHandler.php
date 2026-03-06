<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetScoringGenericStats;

use App\Domain\Repository\ReviewStatsRepository;

final readonly class GetScoringGenericStatsHandler
{
    public function __construct(private ReviewStatsRepository $reviewStats)
    {
    }

    public function handle(): GetScoringGenericStatsResult
    {
        $items = $this->reviewStats->getScoringGenericStats();

        return new GetScoringGenericStatsResult(
            items: array_map(
                static fn ($item): array => [
                    'label' => $item->label,
                    'count' => $item->count,
                ],
                $items,
            ),
        );
    }
}
