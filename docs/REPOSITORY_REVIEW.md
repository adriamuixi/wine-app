# Repository Review

Date: 2026-04-08

## Summary

This repository is no longer an initial scaffold. It now has:
- a backend organized around the documented `Domain` / `Application` / `Adapters` / `Bootstrap` structure
- PHPUnit coverage across use cases and HTTP adapters
- active public, private, and mobile application surfaces
- production-oriented Docker assets and GitHub workflow automation

The main risks today are not “missing architecture,” but consistency drift between:
- docs and implementation
- API guides and actual routes
- business-rule wording and current behavior

## Current State

### Backend

Present:
- hexagonal backend folder structure under `apps/api/src`
- Doctrine persistence adapters and migrations
- controller and use-case test suites under `apps/api/tests`
- OpenAPI documentation in `docs/api/openapi.yaml`

Main gap:
- review score behavior is inconsistent across docs versus implementation

### Frontend

Present:
- `apps/web-public` with feature/page/i18n structure
- `apps/web-private` with substantial feature extraction from the original monolith
- shared package workspace under `packages/*`

Main gaps:
- some frontend docs still describe older structure or stale validation status
- `apps/web-private` still has hook dependency lint warnings in `HomePage.tsx`

### Mobile

Present:
- Expo app in `apps/mobile`
- shared package usage from the monorepo
- EAS configuration for preview/production builds

Main gap:
- setup/deploy docs should keep distinguishing local mobile development from Dockerized backend/web deployment

### CI and Operations

Present:
- GitHub workflows under `.github/workflows`
- production compose stack and deploy helper scripts
- DB backup helper script

Main gaps:
- workflow usefulness depends on keeping repo scripts and lint state clean
- production docs must stay aligned with the current domain, TLS, and env setup

## Highest-Value Follow-Up

1. Keep business rules consistent across docs, code, and tests.
2. Keep `docs/api/API_GUIDE.md` and `docs/api/openapi.yaml` aligned with live controller routes.
3. Continue refreshing frontend docs so they describe the current structure rather than earlier refactor milestones.
4. Treat deployment docs as operational documentation tied to real compose/Nginx files, not generic VPS notes.

## Known Documentation Hotspots

- `docs/DOMAIN_RULES_CHECKLIST.md`
  - business-rule wording must match implementation
- `docs/api/API_GUIDE.md`
  - human-readable endpoint inventory must match live routes
- `docs/api/openapi.yaml`
  - should describe only implemented paths
- `docs/FRONTEND_*`
  - should reflect the current page/feature/i18n layout
- `TOPROD.md`
  - should stay aligned with `docker-compose.prod.yml`, `infra/nginx/default.prod.conf`, and deploy scripts

## Overall Assessment

The repo is in active product-development shape, not bootstrap shape.

The priority now is reliability through consistency:
- one documented architecture
- one accurate API contract
- one clear statement of business rules
- one current deployment story
