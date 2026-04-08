<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetPairAgreementStats;

final readonly class GetPairAgreementStatsByDoResult
{
    public function __construct(
        public ?string $doName,
        public int $comparedWines,
        public float $avgDiff,
    ) {
    }
}
