<?php

declare(strict_types=1);

namespace App\Adapters\Out\AI;

use App\Application\Ports\WineDraftGenerator;
use App\Application\UseCases\Wine\GenerateWineDraft\GenerateWineDraftCommand;
use App\Application\UseCases\Wine\GenerateWineDraft\GenerateWineDraftValidationException;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final readonly class OpenAiWineDraftGenerator implements WineDraftGenerator
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private ?string $apiKey,
        private string $model = 'gpt-5',
        private float $timeoutSeconds = 180.0,
        private float $maxDurationSeconds = 240.0,
    ) {
    }

    public function generate(GenerateWineDraftCommand $command): array
    {
        if (null === $this->apiKey || '' === trim($this->apiKey)) {
            throw new GenerateWineDraftValidationException('OPENAI_API_KEY is not configured.');
        }

        $payload = [
            'model' => $this->model,
            'input' => [[
                'role' => 'user',
                'content' => $this->buildContent($command),
            ]],
            'tools' => [
                ['type' => 'web_search'],
            ],
            'include' => ['web_search_call.action.sources'],
            'text' => [
                'format' => [
                    'type' => 'json_schema',
                    'name' => 'wine_draft',
                    'strict' => false,
                    'schema' => $this->responseSchema(),
                ],
            ],
        ];

        $response = $this->httpClient->request('POST', 'https://api.openai.com/v1/responses', [
            'headers' => [
                'Authorization' => 'Bearer '.$this->apiKey,
                'Content-Type' => 'application/json',
            ],
            'json' => $payload,
            'timeout' => $this->timeoutSeconds,
            'max_duration' => $this->maxDurationSeconds,
        ]);

        $data = $response->toArray(false);
        $statusCode = $response->getStatusCode();

        if ($statusCode >= 400) {
            throw new GenerateWineDraftValidationException($this->buildOpenAiErrorMessage($statusCode, $data));
        }

        $text = $this->extractOutputText($data);
        if (null === $text) {
            throw new GenerateWineDraftValidationException('OpenAI did not return a structured draft.');
        }

        $decoded = json_decode($text, true);
        if (!is_array($decoded)) {
            throw new GenerateWineDraftValidationException('OpenAI returned invalid JSON for wine draft.');
        }

        return $decoded;
    }

    /**
     * @return list<array<string,mixed>>
     */
    private function buildContent(GenerateWineDraftCommand $command): array
    {
        $content = [[
            'type' => 'input_text',
            'text' => $this->buildPrompt($command),
        ]];

        $content[] = $this->buildImageDescriptor('Front label image. Prioritize wine name, winery, appellation, vintage, and visible front-label clues.');
        $content[] = $this->buildImageContent($command->wineImage);

        if (null !== $command->backLabelImage) {
            $content[] = $this->buildImageDescriptor('Back label image. Use this for technical details such as grapes, alcohol, importer text, tasting notes, and legal label details.');
            $content[] = $this->buildImageContent($command->backLabelImage);
        }

        if (null !== $command->ticketImage) {
            $content[] = $this->buildImageDescriptor('Ticket or receipt image. Use this as direct evidence for place, price, purchase date, and merchant details.');
            $content[] = $this->buildImageContent($command->ticketImage);
        }

        return $content;
    }

    /**
     * @param array{sourcePath: string, originalFilename: string, mimeType: string, size: int} $image
     *
     * @return array<string,mixed>
     */
    private function buildImageContent(array $image): array
    {
        $binary = file_get_contents($image['sourcePath']);
        if (false === $binary) {
            throw new GenerateWineDraftValidationException(sprintf('Unable to read uploaded file "%s".', $image['originalFilename']));
        }

        return [
            'type' => 'input_image',
            'image_url' => sprintf('data:%s;base64,%s', $image['mimeType'], base64_encode($binary)),
            'detail' => 'high',
        ];
    }

    /**
     * @return array{type: string, text: string}
     */
    private function buildImageDescriptor(string $text): array
    {
        return [
            'type' => 'input_text',
            'text' => $text,
        ];
    }

    private function buildPrompt(GenerateWineDraftCommand $command): string
    {
        $location = $command->location;

        return implode("\n", [
            'Task: extract a wine draft from the provided evidence and return exactly one JSON object that matches the schema.',
            'Output rules: no prose, no markdown, no code fences, no explanations, no preamble, no trailing text.',
            'Never explain your reasoning. Put all useful output only inside the JSON fields.',
            'Use web search only when the images, ticket, notes, or location are not enough to identify or complete fields safely.',
            'If a value is unknown, ambiguous, or unsupported, use null instead of guessing.',
            'Do not invent ids. Use textual names for grapes and DOs. The backend will resolve ids later.',
            'If direct evidence conflicts with internet research, direct evidence wins. Keep the chosen value and add a short warning.',
            'Evidence priority:',
            '1. ticket for merchant, price, purchase date, and purchase place clues',
            '2. front label for wine name, winery, appellation, and vintage',
            '3. back label for grapes, alcohol percentage, importer, and technical/legal details',
            '4. user notes and user location as context',
            '5. internet research only as enrichment when needed',
            'Allowed enum values:',
            'wine_type: red, white, rose, sparkling, sweet, fortified',
            'wine.country: spain, france, italy, portugal, germany, argentina, chile, united_states, south_africa, australia',
            'purchase.country: use a world-country slug such as spain, united_kingdom, united_states, japan, or france',
            'aging_type: young, crianza, reserve, grand_reserve',
            'place_type: restaurant, supermarket',
            'award names: decanter, penin, wine_spectator, parker, james_suckling, guia_proensa',
            'decanter awards: use value gold|silver|bronze|platinum and keep score/year null.',
            'wine_spectator awards: use only year and keep score/value null.',
            'field_metadata rules: every returned metadata item must use confidence low|medium|high and source image|ticket|user_text|location|internet|combined.',
            'field_metadata keys: wine.name, wine.winery, wine.wine_type, wine.country, wine.aging_type, wine.vintage_year, wine.alcohol_percentage, wine.do_name, purchase.place_name, purchase.address, purchase.city, purchase.country, purchase.price_paid, purchase.purchased_at.',
            'warnings rules: keep warnings short and factual. Use warnings only for ambiguity, conflict, or unresolved matches.',
            'research_summary rules: keep it null unless web research materially helped. If used, keep it to one short sentence.',
            sprintf('User notes: %s', $command->notes ?? '(none)'),
            sprintf('User price override: %s', $command->priceOverride ?? '(none)'),
            sprintf('User place type hint: %s', $command->placeType ?? '(none)'),
            sprintf('User location name: %s', $location['name'] ?? '(none)'),
            sprintf('User location address: %s', $location['address'] ?? '(none)'),
            sprintf('User location city: %s', $location['city'] ?? '(none)'),
            sprintf('User location country: %s', $location['country'] ?? '(none)'),
            sprintf('User location latitude: %s', isset($location['latitude']) ? (string) $location['latitude'] : '(none)'),
            sprintf('User location longitude: %s', isset($location['longitude']) ? (string) $location['longitude'] : '(none)'),
        ]);
    }

    /**
     * @param array<string,mixed> $response
     */
    private function extractOutputText(array $response): ?string
    {
        if (isset($response['output_text']) && is_string($response['output_text']) && '' !== trim($response['output_text'])) {
            return $response['output_text'];
        }

        $output = $response['output'] ?? null;
        if (!is_array($output)) {
            return null;
        }

        foreach ($output as $item) {
            if (!is_array($item)) {
                continue;
            }

            $content = $item['content'] ?? null;
            if (!is_array($content)) {
                continue;
            }

            foreach ($content as $part) {
                if (!is_array($part)) {
                    continue;
                }

                $text = $part['text'] ?? null;
                if (is_string($text) && '' !== trim($text)) {
                    return $text;
                }
            }
        }

        return null;
    }

    /**
     * @param array<string,mixed> $response
     */
    private function buildOpenAiErrorMessage(int $statusCode, array $response): string
    {
        $error = $response['error'] ?? null;
        $providerMessage = null;

        if (is_array($error)) {
            $message = $error['message'] ?? null;
            if (is_string($message) && '' !== trim($message)) {
                $providerMessage = trim($message);
            }
        }

        return match ($statusCode) {
            401 => $providerMessage ?? 'OpenAI rejected the API key. Check OPENAI_API_KEY.',
            402 => $providerMessage ?? 'OpenAI billing is required before this request can run.',
            403 => $providerMessage ?? 'OpenAI rejected this request due to permissions or project restrictions.',
            429 => $providerMessage ?? 'OpenAI rate limit or quota exceeded. Check billing, credits, and project limits.',
            default => $providerMessage ?? sprintf('OpenAI request failed with status %d.', $statusCode),
        };
    }

    /**
     * @return array<string,mixed>
     */
    private function responseSchema(): array
    {
        return [
            'type' => 'object',
            'additionalProperties' => false,
            'properties' => [
                'wine' => [
                    'type' => 'object',
                    'additionalProperties' => true,
                    'properties' => [
                        'name' => ['type' => ['string', 'null']],
                        'winery' => ['type' => ['string', 'null']],
                        'wine_type' => ['type' => ['string', 'null']],
                        'country' => ['type' => ['string', 'null']],
                        'aging_type' => ['type' => ['string', 'null']],
                        'vintage_year' => ['type' => ['integer', 'null']],
                        'alcohol_percentage' => ['type' => ['number', 'null']],
                        'do_name' => ['type' => ['string', 'null']],
                        'do_region' => ['type' => ['string', 'null']],
                    ],
                    'required' => ['name', 'winery', 'wine_type', 'country', 'aging_type', 'vintage_year', 'alcohol_percentage', 'do_name', 'do_region'],
                ],
                'purchase' => [
                    'type' => 'object',
                    'additionalProperties' => true,
                    'properties' => [
                        'place_type' => ['type' => ['string', 'null']],
                        'place_name' => ['type' => ['string', 'null']],
                        'address' => ['type' => ['string', 'null']],
                        'city' => ['type' => ['string', 'null']],
                        'country' => ['type' => ['string', 'null']],
                        'price_paid' => ['type' => ['number', 'string', 'null']],
                        'purchased_at' => ['type' => ['string', 'null']],
                        'map_data' => [
                            'type' => ['object', 'null'],
                            'additionalProperties' => true,
                            'properties' => [
                                'lat' => ['type' => ['number', 'null']],
                                'lng' => ['type' => ['number', 'null']],
                            ],
                            'required' => ['lat', 'lng'],
                        ],
                    ],
                    'required' => ['place_type', 'place_name', 'address', 'city', 'country', 'price_paid', 'purchased_at', 'map_data'],
                ],
                'grapes' => [
                    'type' => 'array',
                    'items' => [
                        'type' => 'object',
                        'additionalProperties' => true,
                        'properties' => [
                            'name' => ['type' => 'string'],
                            'percentage' => ['type' => ['number', 'null']],
                        ],
                        'required' => ['name', 'percentage'],
                    ],
                ],
                'awards' => [
                    'type' => 'array',
                    'items' => [
                        'type' => 'object',
                        'additionalProperties' => true,
                        'properties' => [
                            'name' => ['type' => ['string', 'null']],
                            'score' => ['type' => ['number', 'null']],
                            'year' => ['type' => ['integer', 'null']],
                            'value' => ['type' => ['string', 'null']],
                        ],
                        'required' => ['name', 'score', 'year', 'value'],
                    ],
                ],
                'field_metadata' => [
                    'type' => 'object',
                    'additionalProperties' => [
                        'type' => 'object',
                        'additionalProperties' => false,
                        'properties' => [
                            'confidence' => ['type' => 'string'],
                            'source' => ['type' => 'string'],
                            'notes' => ['type' => ['string', 'null']],
                        ],
                        'required' => ['confidence', 'source', 'notes'],
                    ],
                ],
                'warnings' => [
                    'type' => 'array',
                    'items' => ['type' => 'string'],
                ],
                'research_summary' => ['type' => ['string', 'null']],
            ],
            'required' => ['wine', 'purchase', 'grapes', 'awards', 'field_metadata', 'warnings', 'research_summary'],
        ];
    }
}
