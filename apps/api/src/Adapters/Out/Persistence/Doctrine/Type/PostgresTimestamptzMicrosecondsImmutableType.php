<?php

declare(strict_types=1);

namespace App\Adapters\Out\Persistence\Doctrine\Type;

use DateTimeImmutable;
use Doctrine\DBAL\Platforms\AbstractPlatform;
use Doctrine\DBAL\Types\DateTimeTzImmutableType;
use Doctrine\DBAL\Types\Exception\InvalidType;
use Doctrine\DBAL\Types\Exception\ValueNotConvertible;
use Exception;

final class PostgresTimestamptzMicrosecondsImmutableType extends DateTimeTzImmutableType
{
    public const NAME = 'app_timestamptz_immutable';

    public function convertToDatabaseValue(mixed $value, AbstractPlatform $platform): ?string
    {
        if ($value === null) {
            return null;
        }

        if (!$value instanceof DateTimeImmutable) {
            throw InvalidType::new(
                $value,
                static::class,
                ['null', DateTimeImmutable::class],
            );
        }

        // Keep microseconds when present and store as PostgreSQL timestamptz-compatible literal.
        return $value->format('Y-m-d H:i:s.uP');
    }

    public function convertToPHPValue(mixed $value, AbstractPlatform $platform): ?DateTimeImmutable
    {
        if ($value === null || $value instanceof DateTimeImmutable) {
            return $value;
        }

        try {
            return new DateTimeImmutable((string) $value);
        } catch (Exception $e) {
            throw ValueNotConvertible::new((string) $value, DateTimeImmutable::class, $e->getMessage(), $e);
        }
    }
}
