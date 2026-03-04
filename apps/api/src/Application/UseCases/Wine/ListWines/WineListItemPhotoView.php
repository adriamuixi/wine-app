<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\ListWines;

final readonly class WineListItemPhotoView
{
    public function __construct(
        public string $type,
        public ?string $url,
    ) {
    }
}
