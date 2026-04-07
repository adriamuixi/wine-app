# Codex Workspace Guide (Centralized)

This repository already has a strong source-of-truth documentation set.
Do not duplicate rules across files: follow the documents below in order.

## Required Read Order

1. `AGENTS.md`
2. `docs/AI_START_HERE.md`
3. `docs/README.md`
4. `docs/ARCHITECTURE_PLAYBOOK.md`
5. `docs/BACKEND_FEATURE_WORKFLOW.md`
6. `docs/DOMAIN_RULES_CHECKLIST.md`
7. `docs/api/openapi.yaml` (if endpoint behavior changes)

## Single Source of Truth

- Architecture and boundaries: `AGENTS.md` + `docs/ARCHITECTURE_PLAYBOOK.md`
- Backend execution workflow: `docs/BACKEND_FEATURE_WORKFLOW.md`
- Domain invariants: `docs/DOMAIN_RULES_CHECKLIST.md`
- API contract: `docs/api/openapi.yaml`
- Practical API examples: `docs/api/API_GUIDE.md`
- Frontend integration patterns: `docs/FRONTEND_API_GUIDELINES.md`
- Frontend i18n conventions: `docs/FRONTEND_LOCALE_GUIDE.md`

## Delivery Checklist (Short)

- Respect Hexagonal boundaries (`Domain`, `Application`, `Adapters`).
- If API changes: update `openapi.yaml` + controller tests + use case tests.
- If DB schema changes: create Doctrine migration (never `schema:update`).
- Keep domain integrity first (place/price required, one review per user+wine, etc.).
- Run targeted tests for touched areas before finishing.

## Notes

- This file is intentionally lightweight and centralized.
- Add or update rules in the source docs above, not here.
