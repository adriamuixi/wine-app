# Architecture Playbook (Hexagonal)

This document defines the current backend organization for `apps/api/src`.

## Canonical Backend Structure

```text
src/
  Domain/
    Enum/
      ... domain enums used across layers
    Model/
      ... business entities and invariants
    Repository/
      ... repository interfaces (domain contracts)

  Application/
    UseCases/
      <Context>/<UseCase>/
        *Command.php
        *Handler.php
        *Result.php
    Ports/
      ... non-repository ports (auth/session/security)

  Adapters/
    In/
      Http/
        ... controllers
    Out/
      Persistence/
        Doctrine/
          Entity/
          Type/
        Repos/
          ... repository implementations
      Storage/
        ... filesystem/storage adapters
      Security/
        ... password/session adapters

  Bootstrap/
    services.yaml
```

## Dependency Direction

Allowed:

- `Adapters/In -> Application`
- `Application -> Domain`
- `Adapters/Out -> Domain` (implements domain contracts)
- `Adapters/Out -> Application` (implements non-domain app ports)

Forbidden:

- `Domain -> Application`
- `Domain -> Symfony/Doctrine`
- `Application -> Doctrine entities`
- `Controllers -> Doctrine repositories directly`

## Layer Responsibilities

### Domain

- Business entities and invariants in `Domain/Model`.
- Reusable enums in `Domain/Enum`.
- Repository interfaces in `Domain/Repository`.

### Application

- Use case orchestration only.
- Command/result DTOs.
- Non-repository adapter ports in `Application/Ports`.

### Adapters

- HTTP controllers and response mapping.
- Doctrine entities and SQL/ORM infrastructure.
- Storage/security implementations.

## Practical Rules

- Keep controllers thin.
- Keep Doctrine entities anemic.
- Keep repository interfaces in domain.
- Keep enum definitions in `Domain/Enum`.
- Do not leak HTTP/database structures into domain models.

## Service Wiring Notes

`Bootstrap/services.yaml` should map domain repository interfaces to adapter implementations and exclude `Domain/Model` and `Domain/Enum` from container auto-services.
