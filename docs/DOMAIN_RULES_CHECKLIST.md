# Domain Rules Checklist (Wine Platform)

This checklist is derived from `AGENTS.md` and should be used during design, implementation, and code review.

## Core Business Invariants

- Wine is global (not owned by users).
- Reviews belong to users.
- One review per user + wine.
- Scores are immutable after creation.
- Place is required.
- Price is required.
- Vintage is a variant, not a new wine.

## Review Axes (0-5 inclusive)

All axes must be present and validated:

- `intensity_aroma`
- `sweetness`
- `acidity`
- `tannin`
- `body`
- `persistence`

Checklist:

- Values are integers (or a domain type that guarantees integer semantics)
- Range is enforced (0..5 inclusive)
- Missing axis is invalid

## Review Tags (Closed List)

Allowed tags:

- `Afrutado`
- `Floral`
- `Especiado`
- `Mineral`
- `Madera marcada`
- `Fácil de beber`
- `Elegante`
- `Potente`
- `Gastronómico`

Checklist:

- Only allowed tags are accepted
- Duplicates are rejected
- Tags do not overlap with axes (semantic separation maintained)

## Modeling Guidance

## Prefer Value Objects for

- `Price`
- `Place`
- `Vintage`
- `ReviewAxes`
- `ReviewTagSet`

Why:

- Centralizes validation
- Reduces magic arrays
- Makes invariants explicit and testable

## Decide Explicitly: Where does each rule live?

Use this split:

- Entity/VO rule: intrinsic invariant (range, required fields, immutability)
- Application rule: cross-aggregate/system rule (one review per user+wine, uniqueness checks via repository)

## Code Review Checklist (Domain Integrity)

Reject code if any are true:

- Business rules only exist in controller validation
- Doctrine entity contains core domain behavior
- Mutable setters allow score changes after creation
- Tags/axes are represented as untyped arrays without validation
- A review can be created without `place` or `price`
- Vintage is modeled as a separate wine identity instead of a variant attribute

## Test Checklist

Each new domain behavior should have tests for:

- Valid creation
- Invalid input/range
- Immutable behavior enforcement
- Duplicate rule enforcement (domain/app layer per design)
- Serialization/mapping edge cases (if infrastructure adapters added)
