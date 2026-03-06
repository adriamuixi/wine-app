<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetScoringGenericStats;

final readonly class GetScoringGenericStatsResult
{
    /**
     * @param list<array{label:string,count:int}> $items
     */
    public function __construct(public array $items)
    {
    }
}
