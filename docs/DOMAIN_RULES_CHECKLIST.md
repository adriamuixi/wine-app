# Domain Rules Checklist (Wine Platform)

Use this checklist in design, implementation, and review.

## Folder Conventions (Domain)

- `Domain/Model`: entities and invariants
- `Domain/Enum`: reusable domain enums
- `Domain/Repository`: repository interfaces

## Core Business Invariants

- Wine is global (not user-owned)
- Reviews belong to users
- One review per user + wine
- Scores immutable after creation
- Place required
- Price required
- Vintage is a variant, not a new wine

## Review Axes (0..5)

- `intensity_aroma`
- `sweetness`
- `acidity`
- `tannin`
- `body`
- `persistence`

Checks:

- numeric integer semantics
- range enforced (0..5)
- missing required axes rejected

## Review Bullets (closed list)

- Afrutado
- Floral
- Especiado
- Mineral
- Madera marcada
- Fácil de beber
- Elegante
- Potente
- Gastronómico

Checks:

- only allowed values
- no duplicates
- semantically separate from axes

## Rule Placement

- Domain entity/VO: intrinsic invariants and consistency
- Application use case: cross-entity/system checks

## Reject If

- business rules only in controller validation
- doctrine records contain domain behavior
- mutable flow bypasses immutability rules
- untyped arrays replace domain models for business data

## Test Checklist

- valid creation path
- invariant violations
- edge value coverage
- cross-rule behavior (at correct layer)
