# 🍷 Wine App

Personal wine catalog & review platform.

Stack:

- Backend: Symfony (PHP 8.4, API-first)
- Frontend: React + Vite (public + private apps)
- Database: PostgreSQL
- Infrastructure: Docker + Docker Compose
- Architecture: Hexagonal (Ports & Adapters)

This repository contains:

- Symfony API backend
- Public React app
- Private React app (admin / personal area)
- PostgreSQL database
- Nginx reverse proxy

## 📦 Project structure

If your Markdown renderer has trouble with tree blocks, this is the structure as a simple list:

 apps/
  - api/ (Symfony API)
  - web-public/ (React public UI)
  - web-private/ (React private UI, served under /admin)
- infra/
  - nginx/ (reverse proxy config)
- docker-compose.yml (root)
- AGENTS.md (AI guidance)
- docs/ (repo-specific architecture and development playbooks)

---

## Requirements

- Docker + Docker Compose
- `just` (recommended) or `make`

Optional (if running React outside Docker):
- Node.js 22+

## Quick start

Using `just`:

```bash
just setup
just health
```

## URLs

Public: http://localhost:8080/

Private: http://localhost:8080/admin/

API: http://localhost:8080/api

## Development guidance

Read these before adding features:

- `AGENTS.md`
- `docs/README.md`
- `docs/ARCHITECTURE_PLAYBOOK.md`
- `docs/BACKEND_FEATURE_WORKFLOW.md`
- `docs/DOMAIN_RULES_CHECKLIST.md`
