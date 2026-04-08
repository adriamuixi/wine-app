<?php

declare(strict_types=1);

namespace App\Tests\Unit\Domain\Model;

use App\Domain\Enum\AwardName;
use App\Domain\Model\Award;
use PHPUnit\Framework\TestCase;

final class AwardTest extends TestCase
{
    public function testDecanterAcceptsMedalValueWithoutScoreOrYear(): void
    {
        $award = new Award(
            name: AwardName::Decanter,
            score: null,
            year: null,
            value: 'gold',
        );

        self::assertSame('gold', $award->value);
        self::assertNull($award->score);
        self::assertNull($award->year);
    }

    public function testDecanterRejectsNumericScore(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        new Award(
            name: AwardName::Decanter,
            score: '95.0',
            year: null,
            value: 'gold',
        );
    }

    public function testNonDecanterRejectsTextualValue(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        new Award(
            name: AwardName::Parker,
            score: '95.0',
            year: 2025,
            value: 'gold',
        );
    }

    public function testWineSpectatorAcceptsOnlyYear(): void
    {
        $award = new Award(
            name: AwardName::WineSpectator,
            score: null,
            year: 2025,
            value: null,
        );

        self::assertNull($award->score);
        self::assertSame(2025, $award->year);
        self::assertNull($award->value);
    }

    public function testWineSpectatorRejectsScore(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        new Award(
            name: AwardName::WineSpectator,
            score: '95.0',
            year: 2025,
            value: null,
        );
    }

    public function testWineSpectatorRejectsValue(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        new Award(
            name: AwardName::WineSpectator,
            score: null,
            year: 2025,
            value: 'gold',
        );
    }
}
