# Wine App

Wine catalog and review platform.

## Stack

- Backend: Symfony (PHP 8.4)
- Frontend: React + Vite (`web-public`, `web-private`)
- Database: PostgreSQL
- Infra: Docker + Docker Compose + Nginx
- Architecture: Hexagonal (Ports & Adapters)

## Repository Structure

- `apps/api`: Symfony API
- `apps/web-public`: public React app
- `apps/web-private`: private/admin React app
- `infra/nginx`: reverse proxy config
- `docs`: architecture/workflow/domain docs

### Backend Structure (`apps/api/src`)

- `Domain/Enum`: reusable domain enums
- `Domain/Model`: business entities and invariants
- `Domain/Repository`: repository contracts (interfaces)
- `Application/UseCases`: use case handlers and DTOs
- `Application/Ports`: non-repository ports (security/session adapters)
- `Adapters/In/Http`: controllers
- `Adapters/Out/Persistence`: Doctrine adapters/entities
- `Adapters/Out/Storage`: file/storage adapters
- `Bootstrap`: dependency wiring

## Quick Start

```bash
just setup
just health
```

## URLs

- Public: `http://localhost:8080/`
- Private: `http://localhost:8080/admin/`
- API: `http://localhost:8080/api`

## Documentation

Read in this order:

1. `AGENTS.md`
2. `docs/README.md`
3. `docs/ARCHITECTURE_PLAYBOOK.md`
4. `docs/BACKEND_FEATURE_WORKFLOW.md`
5. `docs/DOMAIN_RULES_CHECKLIST.md`
