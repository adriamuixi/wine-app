# Backend Feature Workflow (Symfony + Hexagonal)

Use this workflow for every backend feature in `apps/api`.

## Golden Rule

Start from the domain rule, not from the controller or database schema.

## Implementation Sequence

## 1. Write the business rule in plain language

Example:

- “A user can review a wine only once.”
- “Scores are immutable after creation.”
- “Place and price are required.”

If the rule cannot be stated in one sentence, the model is not clear yet.

## 2. Model the domain

Create/update:

- Domain entities/aggregates
- Value Objects
- Domain exceptions

Examples of good VOs in this project:

- `Price`
- `Place`
- `ReviewAxes`
- `ReviewTag` (closed list)

## 3. Add domain unit tests first

Minimum expectations:

- Happy path
- Each invariant violation
- Edge values (axes 0 and 5)
- Duplicate review prevention behavior (at domain or app layer depending design)

## 4. Define the use case in Application layer

Create:

- Command/DTO input
- Handler/service
- Result DTO
- Ports needed by the use case

Typical ports:

- `ReviewRepository`
- `WineRepository`
- `UserRepository`
- `Clock`
- `TransactionManager` (optional, if needed)

## 5. Validate boundary input (UI/API), not domain truth

Use request DTO validation for:

- Required fields
- Primitive format checks
- Basic ranges

But keep business truth in Domain/Application:

- “one review per user + wine”
- “score immutable”

## 6. Implement infrastructure adapters

Add:

- Doctrine persistence entity/entities
- Repository adapter implementing application port
- Domain <-> persistence mappers
- Migration

Do not:

- Return Doctrine entities to controllers
- Reuse Doctrine entities as API responses

## 7. Add thin controller

Controller responsibilities:

- Parse request
- Build command DTO
- Call handler
- Map result to HTTP response
- Set status code

Controller must not:

- Contain branching business rules
- Query Doctrine directly
- Build domain objects from unvalidated raw arrays inline

## 8. Add tests at the right levels

Required for feature completion:

- Domain unit tests
- Application tests (ports mocked/faked)

Recommended:

- Repository integration test
- HTTP endpoint test

## Migration Rules (Important)

- Always create a Doctrine migration for schema changes.
- Never use `doctrine:schema:update` to mutate DB state.
- Review enum changes carefully (PostgreSQL enum migrations are not trivial).

## Definition of Done (Backend Feature)

A backend feature is done only if all are true:

- Domain rule implemented in domain code
- Domain tests added
- Application use case added and tested
- Migration created
- Controller thin and DTO-based
- No direct entity exposure
- API response shape documented (at least in code/tests)
