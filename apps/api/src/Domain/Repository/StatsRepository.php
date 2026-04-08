<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Model\Stats\ActivityStats;
use App\Domain\Model\Stats\CatalogHealthStats;
use App\Domain\Model\Stats\CoverageStats;
use App\Domain\Model\Stats\PairAgreementStats;
use App\Domain\Model\Stats\ScoreDistributionStats;
use App\Domain\Model\Stats\ValueStats;

interface StatsRepository
{
    public function getCoverageStats(int $userId): CoverageStats;

    public function getActivityStats(): ActivityStats;

    public function getScoreDistributionStats(): ScoreDistributionStats;

    public function getValueStats(): ValueStats;

    public function getCatalogHealthStats(): CatalogHealthStats;

    public function getPairAgreementStats(): PairAgreementStats;
}
