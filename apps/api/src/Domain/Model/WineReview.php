<?php

declare(strict_types=1);

namespace App\Domain\Model;

use App\Domain\Enum\ReviewBullet;

final readonly class WineReview
{
    /**
     * @param list<ReviewBullet> $bullets
     */
    public function __construct(
        public int $userId,
        public int $wineId,
        public int $intensityAroma,
        public int $sweetness,
        public int $acidity,
        public ?int $tannin,
        public int $body,
        public int $persistence,
        public array $bullets,
        public ?int $score = null,
        public ?int $id = null,
        public ?\DateTimeImmutable $createdAt = null,
    ) {
        if ($this->userId < 1) {
            throw new \InvalidArgumentException('user_id must be >= 1.');
        }

        if ($this->wineId < 1) {
            throw new \InvalidArgumentException('wine_id must be >= 1.');
        }

        if (null !== $this->id && $this->id < 1) {
            throw new \InvalidArgumentException('review id must be >= 1.');
        }

        if (null !== $this->score && ($this->score < 0 || $this->score > 100)) {
            throw new \InvalidArgumentException('score must be between 0 and 100.');
        }

        self::assertAxisInRange('intensity_aroma', $this->intensityAroma);
        self::assertAxisInRange('sweetness', $this->sweetness);
        self::assertAxisInRange('acidity', $this->acidity);
        self::assertAxisInRange('body', $this->body);
        self::assertAxisInRange('persistence', $this->persistence);

        if (null !== $this->tannin) {
            self::assertAxisInRange('tannin', $this->tannin);
        }

        if (count($this->bullets) !== count(array_unique($this->bullets))) {
            throw new \InvalidArgumentException('review bullets must be unique.');
        }
    }

    private static function assertAxisInRange(string $axis, int $value): void
    {
        if ($value < 0 || $value > 5) {
            throw new \InvalidArgumentException(sprintf('%s must be between 0 and 5.', $axis));
        }
    }
}
