<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\ListWines;

final class ListWinesSort
{
    public const CREATED_AT = 'created_at';
    public const UPDATED_AT = 'updated_at';
    public const NAME = 'name';
    public const VINTAGE_YEAR = 'vintage_year';
    public const SCORE = 'score';

    public const ASC = 'asc';
    public const DESC = 'desc';
}
