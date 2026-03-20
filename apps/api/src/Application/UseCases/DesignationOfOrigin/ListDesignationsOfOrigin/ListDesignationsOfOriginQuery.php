<?php

declare(strict_types=1);

namespace App\Application\UseCases\DesignationOfOrigin\ListDesignationsOfOrigin;

use App\Domain\Enum\Country;

final readonly class ListDesignationsOfOriginQuery
{
    /**
     * @param list<string> $sortFields
     * @param list<int>    $userIds
     */
    public function __construct(
        public array $sortFields = ListDesignationsOfOriginSort::DEFAULT_ORDER,
        public ?string $name = null,
        public ?Country $country = null,
        public ?string $region = null,
        public array $userIds = [],
    ) {
    }
}
