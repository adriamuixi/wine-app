# AGENTS.md

Repository instructions for AI assistants and copilots.

## Required Read Order

1. `AGENTS.md`
2. `docs/AI_START_HERE.md`
3. `docs/README.md`
4. `docs/ARCHITECTURE_PLAYBOOK.md`
5. `docs/BACKEND_FEATURE_WORKFLOW.md`
6. `docs/DOMAIN_RULES_CHECKLIST.md`
7. `docs/api/openapi.yaml` (if endpoints are touched)

## Architecture Rules (Mandatory)

This repository uses Hexagonal Architecture with the current backend structure under `apps/api/src`:

- `Domain/`
  - `Model/` business entities (pure PHP)
  - `Enum/` domain enums shared across layers
  - `Repository/` repository interfaces (domain contracts)
- `Application/`
  - `UseCases/` command/handler/result flow
  - `Ports/` non-repository ports only (e.g., auth/session/security adapters)
- `Adapters/`
  - `In/Http/` controllers
  - `Out/Persistence/` Doctrine entities + repository adapters
  - `Out/Storage/` filesystem/storage adapters
- `Bootstrap/` dependency wiring

### Strict boundaries

- Domain does not depend on Symfony, Doctrine, or HTTP.
- Repository interfaces belong to `Domain/Repository`, not `Application`.
- Controllers must stay thin (parse input -> call handler -> map response).
- Doctrine entities must not contain business logic.

## API Update Rule (Mandatory)

If any endpoint is added/changed/removed, update all:

- `docs/api/openapi.yaml`
- controller tests in `apps/api/tests/Unit/Adapters/In/Http/`
- use case tests in `apps/api/tests/Unit/Application/UseCases/`

## Database Rules

- PostgreSQL + Doctrine ORM.
- Migrations are mandatory.
- Do not use `schema:update` for project changes.
- Primary keys are `BIGINT`.
- Enums in DB must be aligned with `Domain/Enum`.

## Domain Rules (Core)

- Wine is global (not owned by users).
- Reviews belong to users.
- One review per user + wine.
- Scores are immutable after creation.
- Place and price are required.
- Vintage is a variant, not a new wine.

## Testing Rules

- PHPUnit required.
- Domain logic must have unit tests.
- Application use cases must be covered.
- HTTP endpoints need controller or integration coverage.
- No business refactor without corresponding tests.

## Coding Standards

- Backend: PHP 8.4, `declare(strict_types=1);`, PSR-12.
- Constructor injection only.
- No magic arrays for domain entities.
- Prefer explicit mapping between layers.

## Delivery Expectation

Prioritize correctness and domain integrity over speed.
