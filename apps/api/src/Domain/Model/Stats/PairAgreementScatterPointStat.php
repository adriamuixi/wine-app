<?php

declare(strict_types=1);

namespace App\Domain\Model\Stats;

final readonly class PairAgreementScatterPointStat
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
