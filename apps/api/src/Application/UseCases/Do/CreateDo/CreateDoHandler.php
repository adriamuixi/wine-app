<?php

declare(strict_types=1);

namespace App\Application\UseCases\Do\CreateDo;

use App\Application\UseCases\Photo\PhotoInputGuard;
use App\Domain\Model\DenominationOfOrigin;
use App\Domain\Repository\DoRepository;

final readonly class CreateDoHandler
{
    public function __construct(
        private DoRepository $dos,
        private PhotoInputGuard $photoInputGuard,
    )
    {
    }

    public function handle(CreateDoCommand $command): CreateDoResult
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

            $do = new DenominationOfOrigin(
                id: 1,
                name: $command->name,
                region: $command->region,
                country: $command->country,
                countryCode: strtoupper($command->countryCode),
                doLogo: $command->doLogo,
                regionLogo: null,
            );
        } catch (\InvalidArgumentException $exception) {
            throw new CreateDoValidationException($exception->getMessage(), previous: $exception);
        }

        $id = $this->dos->create($do);

        return new CreateDoResult($id);
    }
}
