# Wine App API Guide

Human-readable API overview for the current backend implementation.

The machine-readable source of truth is:
- `docs/api/openapi.yaml`

Base URL (local):
- `http://localhost:8080`

Important:
- Web clients use the Symfony session flow.
- Mobile clients can use bearer auth via `POST /api/auth/token`.
- Some stats endpoints currently use legacy typoed paths because that is what the controller implementation exposes today.

## Conventions

- JSON requests use `Content-Type: application/json`
- file uploads use `multipart/form-data`
- IDs are `int64`
- common errors:
  - `400` invalid input
  - `401` unauthenticated
  - `403` forbidden
  - `404` not found
  - `409` conflict

## System

- `GET /api`
  - health check
- `GET /guide.md`
  - returns this markdown guide

Example:

```bash
curl -s http://localhost:8080/api | jq
```

## Auth

- `POST /api/auth/login`
  - email/password login for session-based clients
- `POST /api/auth/token`
  - issues bearer token for mobile/API clients
- `GET /api/auth/me`
  - returns current authenticated user
- `PUT /api/auth/me`
  - updates current authenticated user
- `POST /api/auth/logout`
  - clears the current session
- `POST /api/auth/users`
  - creates a user, requires authenticated session
- `DELETE /api/auth/users`
  - deletes a user by email, requires authenticated session

Session login example:

```bash
curl -i -c cookies.txt -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"secret"}'
```

Bearer token example:

```bash
curl -s -X POST http://localhost:8080/api/auth/token \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"secret"}' | jq
```

## Reviews

- `GET /api/reviews`
  - paginated review list
- `GET /api/wines/{wineId}/reviews/{id}`
  - fetch single review
- `POST /api/wines/{wineId}/reviews`
  - create review for authenticated user
- `PUT /api/wines/{wineId}/reviews/{id}`
  - update review fields
- `DELETE /api/wines/{wineId}/reviews/{id}`
  - delete review

Notes:
- Current implementation allows review score updates on edit.
- `created_at` accepts `YYYY-MM-DD` or full ISO-8601 when supported by the use case/controller flow.

Create example:

```bash
curl -s -b cookies.txt -X POST http://localhost:8080/api/wines/2/reviews \
  -H 'Content-Type: application/json' \
  -d '{"created_at":"2025-12-24","score":88,"aroma":4,"appearance":2,"palate_entry":3,"body":4,"persistence":4,"bullets":["floral"]}' | jq
```

## Stats

Current implemented paths:

- `GET /api/stats/generic`
- `GET /api/stats/reviews-per-monh`
- `GET /api/stats/socring-generic`

Important:
- The `reviews-per-monh` and `socring-generic` spellings are legacy typoed route names, but they are the live routes exposed by the controller today.

Examples:

```bash
curl -s -b cookies.txt http://localhost:8080/api/stats/generic | jq
curl -s -b cookies.txt http://localhost:8080/api/stats/reviews-per-monh | jq
curl -s -b cookies.txt http://localhost:8080/api/stats/socring-generic | jq
```

## Grapes and DOs

- `GET /api/grapes`
  - returns grapes
- `GET /api/dos`
  - lists denominations of origin
- `POST /api/dos`
  - creates denomination of origin
- `PUT /api/dos/{id}`
  - updates denomination of origin
- `DELETE /api/dos/{id}`
  - deletes denomination of origin
- `POST /api/dos/{id}/assets`
  - uploads DO assets

List example:

```bash
curl -s "http://localhost:8080/api/dos?name=rio&country=spain&region=rioja" | jq
```

## Wines

- `GET /api/wines`
  - paginated wine listing with filters
- `POST /api/wines`
  - create wine
- `POST /api/wines/draft-from-ai`
  - create AI-assisted wine draft from uploaded files
- `GET /api/wines/{id}`
  - fetch wine details
- `PUT /api/wines/{id}`
  - update wine
- `DELETE /api/wines/{id}`
  - delete wine
- `POST /api/wines/{id}/photos`
  - upload or replace wine photos

AI draft example:

```bash
curl -s -b cookies.txt -X POST http://localhost:8080/api/wines/draft-from-ai \
  -F 'wine_image=@/path/to/front.jpg' \
  -F 'back_label_image=@/path/to/back.jpg' \
  -F 'ticket_image=@/path/to/ticket.jpg' \
  -F 'notes=Manual notes' | jq
```

Wine photo example:

```bash
curl -s -b cookies.txt -X POST http://localhost:8080/api/wines/1/photos \
  -F 'type=front_label' \
  -F 'file=@/path/to/front.jpg' | jq
```

## Recommendation

Use this file for quick orientation, but rely on:
- `docs/api/openapi.yaml` for request/response shapes
- controller tests in `apps/api/tests/Unit/Adapters/In/Http/`
- use case tests in `apps/api/tests/Unit/Application/UseCases/`

