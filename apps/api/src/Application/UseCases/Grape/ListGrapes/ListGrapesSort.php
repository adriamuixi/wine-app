<?php

declare(strict_types=1);

namespace App\Application\UseCases\Grape\ListGrapes;

final class ListGrapesSort
{
    public const COLOR = 'color';
    public const NAME = 'name';

    /** @var list<string> */
    public const ALLOWED = [
        self::COLOR,
        self::NAME,
    ];

    /** @var list<string> */
    public const DEFAULT_ORDER = [
        self::COLOR,
        self::NAME,
    ];
}

