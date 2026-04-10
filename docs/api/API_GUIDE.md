# Wine App API Guide

Human-readable overview of the API routes currently exposed by the backend.

Primary references:
- `docs/api/openapi.yaml`
- `apps/api/src/Adapters/In/Http/*Controller.php`
- `apps/api/tests/Unit/Adapters/In/Http/`

Base URL (local):
- `http://localhost:8080`

Auth model:
- Web clients use the Symfony session cookie flow.
- Mobile/API clients can use bearer auth via `POST /api/auth/token`.

General conventions:
- JSON requests use `Content-Type: application/json`
- file uploads use `multipart/form-data`
- IDs are `int64`
- common errors are `400`, `401`, `403`, `404`, `409`

## System

- `GET /api`
  - health check
- `GET /guide.md`
  - returns this Markdown guide

Example:

```bash
curl -s http://localhost:8080/api | jq
```

## Auth

- `POST /api/auth/login`
  - session login with `email` and `password`
- `POST /api/auth/token`
  - issues bearer token with `email` and `password`
- `GET /api/auth/me`
  - returns current authenticated user
- `PUT /api/auth/me`
  - updates current user with `name`, `lastname`, optional `password`
- `POST /api/auth/logout`
  - clears the current session
- `POST /api/auth/users`
  - creates a user, requires authenticated session or bearer auth
- `DELETE /api/auth/users`
  - deletes a user by `email`, requires authenticated session or bearer auth

Examples:

```bash
curl -i -c cookies.txt -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"secret"}'
```

```bash
curl -s -X POST http://localhost:8080/api/auth/token \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"secret"}' | jq
```

## Reviews

- `GET /api/reviews`
  - paginated review list
  - query params:
    - `page`, `limit`
    - `sort_by`: review sort field
    - `sort_dir`: `asc|desc`
    - `user_id`: optional numeric id
    - `user_id=me`: current authenticated user
- `GET /api/wines/{wineId}/reviews/{id}`
  - fetch a single review
- `POST /api/wines/{wineId}/reviews`
  - create review for the authenticated user
- `PUT /api/wines/{wineId}/reviews/{id}`
  - update review, only allowed for the owner
- `DELETE /api/wines/{wineId}/reviews/{id}`
  - delete review, only allowed for the owner

Review payload fields:
- `aroma`
- `appearance`
- `palate_entry`
- `body`
- `persistence`
- `bullets`
- optional `score`
- optional `created_at`

Notes:
- current implementation allows review score updates on edit
- `created_at` accepts a date/datetime value supported by the controller/use case flow

Example:

```bash
curl -s -b cookies.txt -X POST http://localhost:8080/api/wines/2/reviews \
  -H 'Content-Type: application/json' \
  -d '{"created_at":"2025-12-24","score":88,"aroma":4,"appearance":2,"palate_entry":3,"body":4,"persistence":4,"bullets":["floral"]}' | jq
```

## Stats

Currently exposed stats routes:

- `GET /api/stats/generic`
- `GET /api/stats/reviews-per-monh`
- `GET /api/stats/socring-generic`
- `GET /api/stats/coverage`
- `GET /api/stats/activity`
- `GET /api/stats/score-distribution`
- `GET /api/stats/value`
- `GET /api/stats/catalog-health`
- `GET /api/stats/pair-agreement`

Important:
- `reviews-per-monh` and `socring-generic` are legacy typoed route names, but they are the live routes exposed by the controller

Examples:

```bash
curl -s -b cookies.txt http://localhost:8080/api/stats/generic | jq
curl -s -b cookies.txt http://localhost:8080/api/stats/reviews-per-monh | jq
curl -s -b cookies.txt http://localhost:8080/api/stats/coverage | jq
curl -s -b cookies.txt http://localhost:8080/api/stats/value | jq
```

## Grapes

- `GET /api/grapes`
  - returns `{ items: [...] }`
  - each item includes `id`, `name`, `color`

Example:

```bash
curl -s http://localhost:8080/api/grapes | jq
```

## Denominations Of Origin

- `GET /api/dos`
  - list DOs
  - filters:
    - `name`
    - `country`
    - `region`
    - `user_ids` as comma-separated ids, for example `1,2`
    - `has_wines=true|false`
  - sorting:
    - `sort_by_1`
    - `sort_by_2`
    - `sort_by_3`
  - allowed sort fields are `country`, `region`, `name`
- `POST /api/dos`
  - create DO
  - JSON fields:
    - required `name`, `region`, `country`, `country_code`
    - optional `do_logo`
    - optional `map_data`
  - `region_logo` cannot be created through this JSON endpoint
- `PUT /api/dos/{id}`
  - partial update for DO
  - accepts partial fields including `do_logo`, `region_logo`, `map_data`
- `DELETE /api/dos/{id}`
  - delete DO
  - returns `409` when the DO still has associated wines
- `POST /api/dos/{id}/assets`
  - upload a DO asset
  - multipart fields:
    - `type`: `do_logo` or `region_logo`
    - `file`

Example:

```bash
curl -s "http://localhost:8080/api/dos?country=spain&has_wines=true&sort_by_1=country&sort_by_2=region&sort_by_3=name" | jq
```

## Wines

- `GET /api/wines`
  - paginated wine list
  - query params:
    - `page`, `limit` with `limit <= 100`
    - `search`
    - `wine_type`
    - `country`
    - `do_id`
    - `grape_id`
    - `score_min`
    - `score_max`
    - `score_bucket`
    - `sort_by`
    - `sort_dir`
  - current `sort_by` values:
    - `created_at`
    - `updated_at`
    - `name`
    - `vintage_year`
    - `score`
    - `price`
    - `tasted_at`
  - each list item includes:
    - `avg_score`
    - `price_paid`
    - `purchased_at`
    - `updated_at`
    - `grapes`, `awards`, `photos`, `reviews`
- `GET /api/wines/route`
  - chronological purchase route for wines with mapped purchase locations
- `POST /api/wines`
  - create wine
- `POST /api/wines/draft-from-ai`
  - AI-assisted wine draft from uploaded images/files
- `GET /api/wines/{id}`
  - fetch wine details
- `PUT /api/wines/{id}`
  - partial update of wine
- `DELETE /api/wines/{id}`
  - delete wine
- `POST /api/wines/{id}/photos`
  - upload or replace a wine photo by type
  - multipart fields:
    - `type`: `front_label`, `back_label`, `bottle`, `situation`
    - `file`

Examples:

```bash
curl -s "http://localhost:8080/api/wines?page=1&limit=100&sort_by=price&sort_dir=asc" | jq
```

```bash
curl -s http://localhost:8080/api/wines/route | jq
```

```bash
curl -s -b cookies.txt -X POST http://localhost:8080/api/wines/draft-from-ai \
  -F 'wine_image=@/path/to/front.jpg' \
  -F 'back_label_image=@/path/to/back.jpg' \
  -F 'ticket_image=@/path/to/ticket.jpg' \
  -F 'notes=Manual notes' | jq
```

```bash
curl -s -b cookies.txt -X POST http://localhost:8080/api/wines/1/photos \
  -F 'type=front_label' \
  -F 'file=@/path/to/front.jpg' | jq
```

## Recommendation

Use this file for quick orientation, but rely on:
- `docs/api/openapi.yaml` for request/response shapes
- controller code in `apps/api/src/Adapters/In/Http/`
- controller tests in `apps/api/tests/Unit/Adapters/In/Http/`
- use case tests in `apps/api/tests/Unit/Application/UseCases/`
