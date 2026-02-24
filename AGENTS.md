
---

# 📄 AGENTS.md

This file is for AI assistants, copilots and automated agents.

## AI Startup Docs (Repository convention)

After reading `AGENTS.md`, agents should read these files before making changes:

1. `docs/AI_START_HERE.md`
2. `docs/README.md`
3. `docs/ARCHITECTURE_PLAYBOOK.md`
4. `docs/BACKEND_FEATURE_WORKFLOW.md`
5. `docs/DOMAIN_RULES_CHECKLIST.md`
6. `docs/api/openapi.yaml` (if API endpoints are involved)

## API Documentation & Test Update Rule

If any API endpoint is added/changed/removed, agents must update:

- OpenAPI docs (`docs/api/openapi.yaml`)
- Controller tests (`apps/api/tests/Unit/Adapters/In/Http/`)
- Use case tests (`apps/api/tests/Unit/Application/UseCases/`)

```markdown
# 🤖 AGENTS.md

This repository is designed to be used with AI assistants.

All agents MUST follow these rules.

---

## 🧱 Architecture

This project uses **Hexagonal Architecture (Ports & Adapters)**.

Backend layers:

1. Domain
   - Pure PHP
   - No Symfony
   - No Doctrine
   - No framework dependencies

2. Application
   - Use cases
   - DTOs
   - Interfaces (ports)

3. Infrastructure
   - Doctrine repositories
   - Symfony services
   - Controllers
   - External adapters

4. UI / API
   - HTTP controllers
   - Request/Response mapping

STRICT RULE:

❌ Controllers must NOT contain business logic  
❌ Doctrine entities must NOT contain business logic  
✅ Domain models contain business rules

---

## 🗃 Database

- PostgreSQL
- Doctrine ORM
- Migrations are mandatory
- No schema:update

Primary keys are BIGINT.

Enums are PostgreSQL ENUM types.

---

## 🧪 Testing

Required:

- PHPUnit
- Domain must have unit tests
- Application services must be covered
- Infrastructure may use integration tests
- HTTP controllers/endpoints must have tests (unit or integration)
- Auth endpoints must include controller tests + use case tests + OpenAPI docs updates

No code without tests for domain logic.

---

## 🧑‍💻 Coding standards

Backend:

- PHP 8.4
- Strict types
- PSR-12
- Typed properties
- Constructor injection only
- No static helpers

Frontend:

- React + TypeScript
- Functional components only
- No class components

---

## 📐 Formatting

- 2 spaces frontend
- 4 spaces PHP
- No trailing whitespace
- LF line endings

---

## 🧠 Domain rules (important)

- Wine is global
- Users do NOT own wines
- Reviews belong to users
- One review per user + wine
- Scores immutable after creation
- Place always required
- Price always required
- Vintage is variant, not new wine

---

## 🏷 Wine review model

Axes (0–5):

- intensity_aroma
- sweetness
- acidity
- tannin
- body
- persistence

Tags (closed list):

- Afrutado
- Floral
- Especiado
- Mineral
- Madera marcada
- Fácil de beber
- Elegante
- Potente
- Gastronómico

Tags must never overlap axes.

---

## 🔐 Security

- Passwords hashed
- Never expose secrets
- Validate all input
- Use DTOs
- No direct entity exposure

---

## 🐳 Docker

All services must run via docker-compose.

No local PHP installs assumed.

---

## ❌ Forbidden patterns

- Fat controllers
- Active Record
- Business logic in Doctrine entities
- God services
- Circular dependencies
- Magic arrays
- Untyped data

---

## ✅ Preferred patterns

- Value Objects
- Repositories
- Use Cases
- DTOs
- Explicit mapping
- Immutable domain objects

---

## 🧭 Goal

Build a maintainable, testable wine platform with:

- Clear domain
- Stable API
- Minimal coupling
- Long-term evolution

AI agents should prioritize correctness, clarity and domain integrity over speed.
