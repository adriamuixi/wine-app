<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\ListWines;

use App\Domain\Repository\WineRepository;

final readonly class ListWinesHandler
{
    private const SORTABLE_FIELDS = [
        ListWinesSort::CREATED_AT,
        ListWinesSort::UPDATED_AT,
        ListWinesSort::NAME,
        ListWinesSort::VINTAGE_YEAR,
        ListWinesSort::SCORE,
    ];
    private const SORTABLE_DIRECTIONS = [ListWinesSort::ASC, ListWinesSort::DESC];

    public function __construct(private WineRepository $wines)
    {
    }

    public function handle(ListWinesQuery $query): ListWinesResult
    {
        if ($query->page < 1) {
            throw new ListWinesValidationException('page must be >= 1.');
        }

        if ($query->limit < 1 || $query->limit > 100) {
            throw new ListWinesValidationException('limit must be between 1 and 100.');
        }

        if (!in_array($query->sortBy, self::SORTABLE_FIELDS, true)) {
            throw new ListWinesValidationException('Invalid sort_by value.');
        }

        if (!in_array($query->sortDir, self::SORTABLE_DIRECTIONS, true)) {
            throw new ListWinesValidationException('Invalid sort_dir value.');
        }

        if (null !== $query->doId && $query->doId < 1) {
            throw new ListWinesValidationException('do_id must be >= 1.');
        }

        if (null !== $query->grapeId && $query->grapeId < 1) {
            throw new ListWinesValidationException('grape_id must be >= 1.');
        }

        if (null !== $query->scoreMin && ($query->scoreMin < 0 || $query->scoreMin > 100)) {
            throw new ListWinesValidationException('score_min must be between 0 and 100.');
        }

        if (null !== $query->scoreMax && ($query->scoreMax < 0 || $query->scoreMax > 100)) {
            throw new ListWinesValidationException('score_max must be between 0 and 100.');
        }

        if (null !== $query->scoreMin && null !== $query->scoreMax && $query->scoreMin > $query->scoreMax) {
            throw new ListWinesValidationException('score_min cannot be greater than score_max.');
        }

        return $this->wines->findPaginated($query);
    }
}
