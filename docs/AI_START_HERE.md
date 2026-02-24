# AI Start Here

This file is the default companion to `AGENTS.md` for Codex/AI assistants working in this repository.

Read order for every feature/change:

1. `AGENTS.md`
2. `docs/README.md`
3. `docs/ARCHITECTURE_PLAYBOOK.md`
4. `docs/BACKEND_FEATURE_WORKFLOW.md`
5. `docs/DOMAIN_RULES_CHECKLIST.md`
6. `docs/api/openapi.yaml` (for API changes)

## Mandatory updates when changing endpoints

If you add/change/remove an endpoint, update all of:

- Controller tests (`apps/api/tests/Unit/Adapters/In/Http/*`)
- Use case tests (`apps/api/tests/Unit/Application/UseCases/*`)
- `docs/api/openapi.yaml`
- Any affected migration/DB docs if payload or enum storage changes

## Current Auth Endpoints

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

These are session-cookie based endpoints used by `apps/web-private` (and can be reused by any website frontend running on the same domain/origin setup).
