<?php

declare(strict_types=1);

namespace App\Application\UseCases\DesignationOfOrigin\ListDesignationsOfOrigin;

final class ListDesignationsOfOriginSort
{
    public const COUNTRY = 'country';
    public const REGION = 'region';
    public const NAME = 'name';

    public const DEFAULT_ORDER = [
        self::COUNTRY,
        self::REGION,
        self::NAME,
    ];

    public const ALLOWED = [
        self::COUNTRY,
        self::REGION,
        self::NAME,
    ];
}
