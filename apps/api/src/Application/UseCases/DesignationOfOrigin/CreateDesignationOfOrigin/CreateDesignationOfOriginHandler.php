<?php

declare(strict_types=1);

namespace App\Application\UseCases\DesignationOfOrigin\CreateDesignationOfOrigin;

use App\Application\UseCases\Photo\PhotoInputGuard;
use App\Domain\Model\DesignationOfOrigin;
use App\Domain\Repository\DesignationOfOriginRepository;

final readonly class CreateDesignationOfOriginHandler
{
    public function __construct(
        private DesignationOfOriginRepository $dos,
        private PhotoInputGuard $photoInputGuard,
    )
    {
    }

    public function handle(CreateDesignationOfOriginCommand $command): CreateDesignationOfOriginResult
    {
        try {
            if ('' === trim($command->name)) {
                throw new \InvalidArgumentException('name is required.');
            }

            if ('' === trim($command->region)) {
                throw new \InvalidArgumentException('region is required.');
            }

            if ('' === trim($command->countryCode)) {
                throw new \InvalidArgumentException('country_code is required.');
            }

            if (2 !== strlen($command->countryCode)) {
                throw new \InvalidArgumentException('country_code must have 2 characters.');
            }

            if (null !== $command->doLogo) {
                $this->photoInputGuard->assertImageFilename($command->doLogo, 'do_logo');
            }

            $do = new DesignationOfOrigin(
                id: 1,
                name: $command->name,
                region: $command->region,
                country: $command->country,
                countryCode: strtoupper($command->countryCode),
                doLogo: $command->doLogo,
                regionLogo: null,
                mapData: $command->mapData,
            );
        } catch (\InvalidArgumentException $exception) {
            throw new CreateDesignationOfOriginValidationException($exception->getMessage(), previous: $exception);
        }

        $id = $this->dos->create($do);

        return new CreateDesignationOfOriginResult($id);
    }
}
