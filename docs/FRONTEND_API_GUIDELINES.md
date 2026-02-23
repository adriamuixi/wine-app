# Frontend + API Guidelines (Public and Private Apps)

This repo contains two React apps:

- `apps/web-public`
- `apps/web-private`

Both are currently Vite starter templates. Use the same architectural rules in both apps to avoid drift.

## Objectives

- Keep UI logic separate from API transport details.
- Share conventions between public/private apps even if code is not shared yet.
- Prevent “components calling fetch everywhere”.

## Recommended Frontend Structure (per app)

```text
src/
  app/
    routes/
    providers/
  features/
    reviews/
      components/
      api/
      model/
      hooks/
  shared/
    ui/
    lib/
    api/
    types/
```

## API Integration Rules

- Centralize HTTP client code in `shared/api/`.
- Feature modules consume typed API functions, not raw `fetch`.
- Map API DTOs to UI models when needed.
- Keep `VITE_API_BASE` usage inside API client setup, not spread across components.

## Validation and Types

- Validate server responses at boundaries (runtime validation recommended, e.g. Zod).
- Keep form validation close to the feature form, but do not duplicate backend business rules.
- Treat backend as source of truth for invariants.

## React Component Rules

- Functional components only.
- Container/presenter split is optional, but keep side effects out of leaf UI components.
- No business rules in components; UI state and interaction logic only.

## Routing and Access Separation

Public app (`apps/web-public`):

- Marketing/discovery pages
- Public wine catalog views (if applicable)
- Auth entry points

Private app (`apps/web-private`):

- User dashboard
- Review creation/edit flows (respecting backend immutability rules)
- Personal history/preferences

Keep shared concepts aligned, but do not assume identical route trees.

## Frontend Definition of Done

- Feature has typed API boundary
- Loading/error/empty states handled
- Basic accessibility checks (labels, focus, button semantics)
- No raw endpoint strings spread across components
- No mock Vite starter content left in touched screens
