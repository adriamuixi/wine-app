# Repository Review (Scaffold Assessment)

Date: 2026-02-23

## Summary

The repository is a good infrastructure scaffold (Docker + Symfony + 2 React apps + Nginx), but it is still mostly generator output and does not yet implement the Hexagonal Architecture and testing standards defined in `AGENTS.md`.

Current maturity level:

- Infrastructure scaffold: present
- Backend domain/application architecture: not started
- Testing strategy implementation: not started
- Frontend product UI: not started
- Domain model and API contract: not started

## Strengths

- Monorepo structure already separates backend and two frontend apps.
- Docker Compose includes DB, API, two web apps, and Nginx.
- Symfony + Doctrine Migrations baseline is installed.
- Initial domain-oriented enums have started to appear (`apps/api/src/Entity/Enum/*`).

## Findings (Priority Order)

### 1. Broken bootstrap command in `Justfile`

`just setup` calls an undefined recipe:

- `Justfile:83`
- `Justfile:85`

`backend-install` does not exist, so onboarding fails immediately.

Impact:

- New contributors cannot rely on the documented quick start.
- CI scripts that reuse `just setup` would fail.

## 2. Version contract mismatch (AGENTS/README says PHP 8.3, runtime requires 8.4)

The documented backend standard is PHP 8.3, but the codebase requires 8.4:

- `README.md:7`
- `apps/api/composer.json:7`
- `apps/api/Dockerfile:1`

Impact:

- Confusing contributor expectations
- Potential CI/prod mismatch if infra is provisioned for 8.3

Decision needed:

- Standardize on PHP 8.3 or 8.4, then update `AGENTS.md`, `README.md`, Docker, and Composer together.

### 3. Hexagonal Architecture is documented but not yet expressed in the code layout

Current backend code remains in default Symfony structure:

- `apps/api/src/Controller/ApiController.php:1`
- `apps/api/config/services.yaml:19`
- `apps/api/config/services.yaml:20`
- `apps/api/config/packages/doctrine.yaml:20`
- `apps/api/config/packages/doctrine.yaml:21`

Risks:

- `App\` wildcard service registration encourages accidental cross-layer coupling.
- Mapping all persistence classes under `src/Entity` pushes teams toward Doctrine-centric models instead of domain-first models.
- No explicit `Domain`, `Application`, `Infrastructure`, `UI` namespaces yet.

### 4. Testing requirements from `AGENTS.md` are not implemented

No PHPUnit/test pack is configured and no backend tests directory exists:

- `apps/api/composer.json:77`
- `apps/api/composer.json:78`
- `apps/api/tests`

Frontend apps also lack test scripts:

- `apps/web-public/package.json:6`
- `apps/web-public/package.json:10`

Impact:

- Domain rules may drift without executable invariants.
- Refactoring confidence will be low once business logic is added.

### 5. Frontends are still Vite starter templates (public and private)

Both apps contain default Vite/React starter code:

- `apps/web-public/src/App.tsx:1`
- `apps/web-private/src/App.tsx:1`

Impact:

- No product UI structure, routes, API client, or feature modules.
- No shared conventions between public/private apps yet.

### 6. Domain concepts are starting inside `App\Entity\Enum`, which can blur domain vs infrastructure

Enums are domain-ish concepts, but live under an infrastructure-oriented namespace:

- `apps/api/src/Entity/Enum/WineType.php:3`
- `apps/api/src/Entity/Enum/PlaceType.php:3`
- `apps/api/src/Entity/Enum/Country.php:3`
- `apps/api/src/Entity/Enum/AgingType.php:3`

Also, one enum value is inconsistent in formatting:

- `apps/api/src/Entity/Enum/AgingType.php:10` (`Gran_reserva`)

Risk:

- Domain language gets tied to persistence naming too early.
- Inconsistent enum literals leak into API/database later and become migration/API compatibility issues.

### 7. Documentation is useful but currently inconsistent / partially scaffold-oriented

Examples:

- Duplicate “Requirements” sections in `README.md` (`README.md:23` and `README.md:46`)
- Quick start points to `just setup`, which currently fails (`README.md:59`)
- Typo and bootstrap notes mixed into user-facing readme (`README.md:71`)

Impact:

- Onboarding friction
- Ambiguity about what is “current project behavior” vs “bootstrap notes”

### 8. Monorepo ignore/ownership hygiene needs tightening

There is no root `.gitignore` in the monorepo, and container-generated files are already root-owned under `apps/api` (for example `apps/api/vendor`, `apps/api/var`, and several files shown by `ls -la`).

Impact:

- Permission issues while editing from host
- Accidental commits of generated files in other apps if local ignore rules differ

## Recommended Priority Plan

## Phase 1: Make the scaffold safe to use

1. Fix `Justfile` bootstrap (`backend-install` recipe or remove the call).
2. Standardize PHP version (8.3 vs 8.4) across docs and runtime.
3. Add root `.gitignore` for monorepo-generated files.
4. Clean up `README.md` so quick start matches reality.

## Phase 2: Establish architecture rails before feature work

1. Create backend namespaces/folders for `Domain`, `Application`, `Infrastructure`, `UI`.
2. Restrict Doctrine mapping to infrastructure persistence entities only.
3. Restrict service auto-registration to intended namespaces or exclude domain model objects.
4. Add architecture checks (at least conventions/docs; ideally static checks later).

## Phase 3: Add quality gates

1. Add PHPUnit and a first domain unit test suite.
2. Add application service tests.
3. Add frontend test runner (Vitest) and basic component/API tests.
4. Add CI scripts for lint/test/build.

## Phase 4: Implement first vertical slice

Suggested first slice:

- Create wine review (respecting one review per user+wine, immutable score, place/price required)

This forces:

- Domain invariants
- DTOs
- Persistence mapping
- Validation
- API contract
- Frontend form integration

## Definition of Ready for New Features (for this repo)

Before implementing any feature, confirm:

- Domain invariants are written down in `docs/DOMAIN_RULES_CHECKLIST.md`
- API input/output DTOs are defined
- Persistence plan includes migration (no `schema:update`)
- Test plan includes domain + application coverage
- Controller stays thin (mapping only)
