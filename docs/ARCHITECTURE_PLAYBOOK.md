# Architecture Playbook (Hexagonal for This Repo)

This document turns the architectural rules from `AGENTS.md` into a concrete folder and dependency strategy for `apps/api`.

## Goals

- Keep business rules framework-agnostic.
- Prevent Symfony/Doctrine leakage into domain logic.
- Make features implementable as vertical slices without collapsing into fat controllers/services.

## Target Backend Structure (`apps/api/src`)

Use explicit layers and feature-oriented subfolders.

```text
src/
  Domain/
    Wine/
      Model/
      ValueObject/
      Service/
      Event/
      Exception/
    Review/
      Model/
      ValueObject/
      Service/
      Exception/
    Shared/
      ValueObject/

  Application/
    Review/
      CreateReview/
        CreateReviewCommand.php
        CreateReviewHandler.php
        CreateReviewResult.php
    Port/
      Persistence/
      Clock/
      Identity/

  Infrastructure/
    Persistence/
      Doctrine/
        Entity/
        Repository/
        Type/
        Mapper/
    Symfony/
      Service/
      Security/
    External/

  UI/
    Http/
      Api/
        Controller/
        Request/
        Response/
        Mapper/
```

## Dependency Rules (Strict)

Allowed direction:

- `UI -> Application`
- `Infrastructure -> Application` (implements ports)
- `Infrastructure -> Domain` (mapping/persistence adaptation)
- `Application -> Domain`
- `Application -> Application\Port`
- `Domain -> Domain` only

Forbidden:

- `Domain -> Symfony`
- `Domain -> Doctrine`
- `Application -> Doctrine/Symfony concrete classes`
- `UI -> Doctrine repositories directly`

## What Goes in Each Layer

## Domain

Contains:

- Entities/aggregates (pure PHP objects)
- Value Objects
- Domain rules/invariants
- Domain exceptions
- Domain services (only when behavior does not fit an entity/VO)

Avoid:

- Attributes from Doctrine/Symfony
- HTTP concerns
- Serialization concerns
- Arrays as domain payloads

## Application

Contains:

- Use case handlers
- Input/output DTOs (commands/results)
- Ports (interfaces)
- Transaction boundary coordination

Does not contain:

- Doctrine query builder code
- HTTP request parsing
- Symfony validation attributes as business rules

## Infrastructure

Contains:

- Doctrine entities and mappings
- Repository implementations (port adapters)
- Symfony service wiring
- Password hashing adapter
- External clients

Rule:

- Infrastructure translates between persistence shapes and domain objects.

## UI / API

Contains:

- Controllers
- Request validation DTOs
- Response DTOs / serializers
- Mapping from HTTP to application command/result

Rule:

- Controllers orchestrate, they do not decide business rules.

## Naming Conventions

- Domain objects use business names (`Wine`, `Review`, `ScoreAxis`, `Price`, `Place`).
- Use cases use verb phrases (`CreateReview`, `ListWineReviews`, `RegisterUser`).
- Ports end with `Interface` only if your team prefers it consistently; otherwise use role names (`ReviewRepository`, `PasswordHasher`).
- Doctrine entities should be clearly infrastructure-specific (for example suffix `Record` if needed).

## Doctrine Mapping Strategy (Recommended)

Current scaffold maps `src/Entity` globally. For hexagonal alignment, move persistence entities under:

- `src/Infrastructure/Persistence/Doctrine/Entity`

Then configure Doctrine to map only that namespace.

Reason:

- Prevent accidental persistence annotations/attributes on domain classes.
- Make “Doctrine entity != domain aggregate” explicit.

## Service Registration Strategy (Recommended)

Current scaffold autowires all `src/`. Prefer either:

1. Explicit resource imports per layer, or
2. Global import with exclusions for pure domain model folders

Goal:

- Domain model objects are created by code, not container magic.
- Wiring remains predictable.

## First Vertical Slice Template (Backend)

Use this checklist when adding a feature:

1. Add/adjust domain model + invariants.
2. Add domain unit tests.
3. Define application command/result + handler.
4. Add application tests (with fake ports).
5. Implement infrastructure adapters (Doctrine repo, etc.).
6. Create migration.
7. Add thin HTTP controller and request/response mapping.
8. Add integration test (optional initially, recommended soon).
