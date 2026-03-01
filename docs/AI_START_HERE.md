# AI Start Here

Default entrypoint for AI assistants after reading `AGENTS.md`.

## Required Read Order

1. `AGENTS.md`
2. `docs/README.md`
3. `docs/ARCHITECTURE_PLAYBOOK.md`
4. `docs/BACKEND_FEATURE_WORKFLOW.md`
5. `docs/DOMAIN_RULES_CHECKLIST.md`
6. `docs/api/openapi.yaml` (if API changes are involved)

## Mandatory updates when touching endpoints

- `docs/api/openapi.yaml`
- controller tests in `apps/api/tests/Unit/Adapters/In/Http/`
- use case tests in `apps/api/tests/Unit/Application/UseCases/`

## Current Backend Organization Reminder

- `Domain/Enum` for shared enums
- `Domain/Model` for entities
- `Domain/Repository` for repository contracts
- `Application/UseCases` for application orchestration
- `Adapters/*` for incoming/outgoing infrastructure
