<?php

declare(strict_types=1);

namespace App\Application\UseCases\Wine\GenerateWineDraft;

final readonly class GenerateWineDraftResult
{
    /**
     * @param array<string,mixed> $wine
     * @param array<string,mixed> $purchase
     * @param list<array<string,mixed>> $grapes
     * @param list<array<string,mixed>> $awards
     * @param array<string,array{confidence: string, source: string, notes: ?string}> $fieldMetadata
     * @param list<string> $warnings
     * @param list<string> $missingRequiredFields
     */
    public function __construct(
        public array $wine,
        public array $purchase,
        public array $grapes,
        public array $awards,
        public array $fieldMetadata,
        public array $warnings,
        public array $missingRequiredFields,
        public ?string $researchSummary,
    ) {
    }
}
