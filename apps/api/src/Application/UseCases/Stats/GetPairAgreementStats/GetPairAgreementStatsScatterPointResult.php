<?php

declare(strict_types=1);

namespace App\Application\UseCases\Stats\GetPairAgreementStats;

final readonly class GetPairAgreementStatsScatterPointResult
{
    public function __construct(
        public int $wineId,
        public string $wineName,
        public ?string $doName,
        public int $userAScore,
        public int $userBScore,
        public int $diff,
    ) {
    }
}
