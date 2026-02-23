# 🍷 Wine App

Personal wine catalog & review platform.

Stack:

- Backend: Symfony (PHP 8.3, API-first)
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

---

## 🚀 Requirements

- Docker + Docker Compose
- Node.js 22+ (optional, only if running frontend locally)
- `just` (recommended) or `make`

---

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