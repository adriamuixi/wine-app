<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\GenerateWineDraft;

final readonly class GenerateWineDraftCommand
{
    /**
     * @param array{sourcePath: string, originalFilename: string, mimeType: string, size: int} $wineImage
     * @param array{sourcePath: string, originalFilename: string, mimeType: string, size: int}|null $ticketImage
     * @param array{name: ?string, address: ?string, city: ?string, country: ?string, latitude: ?float, longitude: ?float}|null $location
     */
    public function __construct(
        public array $wineImage,
        public ?array $ticketImage,
        public ?string $notes,
        public ?string $priceOverride,
        public ?string $placeType,
        public ?array $location,
    ) {
    }
}
