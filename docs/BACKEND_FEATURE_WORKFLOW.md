# Backend Feature Workflow (Symfony + Hexagonal)

Use this workflow for backend work in `apps/api`.

## 1. Start from business rule

Write the rule first in plain language.

Examples:

- one review per user + wine
- score immutable after creation
- place and price required

## 2. Model domain first

Update in this order when needed:

1. `Domain/Enum` (shared enum values)
2. `Domain/Model` (entities + invariants)
3. `Domain/Repository` (contracts)

## 3. Add/adjust use case

Implement in `Application/UseCases/...`:

- `*Command`
- `*Handler`
- `*Result`

If extra adapter abstractions are needed (non-repository concerns), place them in `Application/Ports`.

## 4. Implement adapters

- Persistence adapters under `Adapters/Out/Persistence/Repos`
- Doctrine entities under `Adapters/Out/Persistence/Doctrine/Entity`
- Storage/security adapters under `Adapters/Out/...`
- HTTP controllers under `Adapters/In/Http`

## 5. Keep boundaries strict

- No business rules in controllers.
- No business rules in Doctrine entities.
- No domain dependency on Symfony/Doctrine.

## 6. Testing

Minimum required for feature completion:

- Use case unit tests (`tests/Unit/Application/UseCases/...`)
- Controller unit/integration tests (`tests/Unit/Adapters/In/Http/...` and/or `tests/Integration/Http/...`)
- Domain unit tests when domain logic changes

## 7. API and DB documentation updates

If endpoint behavior changes:

- Update `docs/api/openapi.yaml`
- Update relevant tests

If schema/enums change:

- Create migration
- Update DB docs when relevant

## Definition of Done

A backend change is done when architecture boundaries are respected, tests pass, and docs/OpenAPI are updated for affected behavior.
