<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Model\WineReview;

interface WineReviewRepository
{
    public function findById(int $id): ?WineReview;

    public function existsByUserAndWine(int $userId, int $wineId): bool;

    public function create(WineReview $review): int;

    public function update(WineReview $review): void;

    public function deleteById(int $id): void;
}
