# Wine App API Guide

This guide documents all available HTTP endpoints with practical examples.

Base URL (local): `http://localhost:8080`

## Table of Contents

- [Conventions](#conventions)
- [Health](#health)
  - [`GET /api`](#get-api)
- [Auth](#auth)
  - [`POST /api/auth/login`](#post-apiauthlogin)
  - [`GET /api/auth/me`](#get-apiauthme)
  - [`POST /api/auth/logout`](#post-apiauthlogout)
- [Wines](#wines)
  - [`GET /api/grapes`](#get-apigrapes)
  - [`GET /api/dos`](#get-apidos)
  - [`GET /api/wines`](#get-apiwines)
  - [`POST /api/wines`](#post-apiwines)
  - [`GET /api/wines/{id}`](#get-apiwinesid)
  - [`PUT /api/wines/{id}`](#put-apiwinesid)
  - [`DELETE /api/wines/{id}`](#delete-apiwinesid)
  - [`POST /api/wines/{id}/photos`](#post-apiwinesidphotos)
- [Guide Endpoint](#guide-endpoint)
  - [`GET /guide.md`](#get-guidemd)

## Conventions

- Content type for JSON requests: `application/json`
- IDs are `int64`
- Time format: ISO-8601 (for example `2026-03-01T10:00:00Z`)
- Main errors:
  - `400` invalid input
  - `401` unauthenticated / invalid credentials
  - `404` not found

---

## Health

### `GET /api`

Checks if API is alive.

Example:

```bash
curl -s http://localhost:8080/api | jq
```

Response:

```json
{
  "status": "ok",
  "service": "wine-api"
}
```

---

## Auth

### `POST /api/auth/login`

Creates session cookie using email/password.

Example 1 (success):

```bash
curl -i -c cookies.txt -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@example.com","password":"demo1234"}'
```

Example 2 (invalid credentials):

```bash
curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@example.com","password":"wrong"}' | jq
```

---

### `GET /api/auth/me`

Returns current authenticated user from session.

Example 1 (authenticated):

```bash
curl -s -b cookies.txt http://localhost:8080/api/auth/me | jq
```

Example 2 (without session):

```bash
curl -s http://localhost:8080/api/auth/me | jq
```

---

### `POST /api/auth/logout`

Clears current session.

```bash
curl -i -b cookies.txt -X POST http://localhost:8080/api/auth/logout
```

---

## Wines

### `GET /api/grapes`

Returns all grapes from DB.

Example:

```bash
curl -s "http://localhost:8080/api/grapes" | jq
```

Response shape:

```json
{
  "items": [
    {
      "id": 1,
      "name": "Tempranillo",
      "color": "red"
    }
  ]
}
```

---

### `GET /api/dos`

Returns all denominations of origin from DB.

Example:

```bash
curl -s "http://localhost:8080/api/dos" | jq
```

Response shape:

```json
{
  "items": [
    {
      "id": 1,
      "name": "Rioja",
      "region": "La Rioja",
      "country": "spain",
      "country_code": "ES"
    }
  ]
}
```

---

### `GET /api/wines`

Paginated wine listing with filters.

Query params:

- `page` default `1`
- `limit` default `20` (max `100`)
- `search` search in wine name, winery, DO name, region
- `wine_type` one of: `red|white|rose|sparkling|sweet|fortified`
- `country` one of country enum values
- `do_id` region/DO id
- `grape_id` grape id
- `score_min` integer `0..100`
- `score_max` integer `0..100`
- `score_bucket` one of: `any|lt70|70_80|80_90|90_plus`
- `sort_by` one of: `created_at|updated_at|name|vintage_year|score`
- `sort_dir` one of: `asc|desc`

Example 1 (default list):

```bash
curl -s "http://localhost:8080/api/wines" | jq
```

Example 2 (search + country + pagination):

```bash
curl -s "http://localhost:8080/api/wines?search=rioja&country=spain&page=2&limit=10" | jq
```

Example 3 (advanced filters from dashboard):

```bash
curl -s "http://localhost:8080/api/wines?wine_type=red&do_id=2&grape_id=5&score_bucket=90_plus&sort_by=score&sort_dir=desc" | jq
```

Example response shape:

```json
{
  "items": [
    {
      "id": 42,
      "name": "Vina del Sol",
      "winery": "Bodega La Sierra",
      "wine_type": "red",
      "country": "spain",
      "do": { "id": 2, "name": "Rioja" },
      "vintage_year": 2020,
      "avg_score": 91.5,
      "updated_at": "2026-03-01T10:00:00+00:00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 1,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  }
}
```

---

### `POST /api/wines`

Creates a wine with optional grapes, purchases, and awards.

Example 1 (minimum):

```bash
curl -s -X POST http://localhost:8080/api/wines \
  -H 'Content-Type: application/json' \
  -d '{"name":"Mencia 2023"}' | jq
```

Example 2 (full payload):

```bash
curl -s -X POST http://localhost:8080/api/wines \
  -H 'Content-Type: application/json' \
  -d '{
    "name":"Gran Reserva Demo",
    "winery":"Bodega Demo",
    "wine_type":"red",
    "do_id":1,
    "country":"spain",
    "aging_type":"reserve",
    "vintage_year":2020,
    "alcohol_percentage":14.5,
    "grapes":[{"grape_id":1,"percentage":85},{"grape_id":2,"percentage":15}],
    "purchases":[{
      "place":{"place_type":"restaurant","name":"Casa Paco","address":"Calle A","city":"Madrid","country":"spain"},
      "price_paid":"25.00",
      "purchased_at":"2026-03-01T10:00:00Z"
    }],
    "awards":[{"name":"parker","score":93.5,"year":2025}]
  }' | jq
```

---

### `GET /api/wines/{id}`

Returns full wine details including grapes, purchases, awards, photos, and reviews.

Example 1 (existing wine):

```bash
curl -s http://localhost:8080/api/wines/1 | jq
```

Example 2 (not found):

```bash
curl -s http://localhost:8080/api/wines/999999 | jq
```

---

### `PUT /api/wines/{id}`

Partial update. Only send fields to change.

Example 1 (simple name update):

```bash
curl -i -X PUT http://localhost:8080/api/wines/1 \
  -H 'Content-Type: application/json' \
  -d '{"name":"Updated Name"}'
```

Example 2 (update multiple fields):

```bash
curl -i -X PUT http://localhost:8080/api/wines/1 \
  -H 'Content-Type: application/json' \
  -d '{"wine_type":"white","vintage_year":2022,"alcohol_percentage":13.0}'
```

---

### `DELETE /api/wines/{id}`

Deletes a wine.

Example 1 (existing):

```bash
curl -i -X DELETE http://localhost:8080/api/wines/1
```

Example 2 (not found):

```bash
curl -s -X DELETE http://localhost:8080/api/wines/999999 | jq
```

---

### `POST /api/wines/{id}/photos`

Uploads/replaces photo by type (`front_label`, `back_label`, `bottle`).

Example 1:

```bash
curl -s -X POST http://localhost:8080/api/wines/1/photos \
  -F 'type=front_label' \
  -F 'file=@/path/to/front.jpg' | jq
```

Example 2 (replace same type):

```bash
curl -s -X POST http://localhost:8080/api/wines/1/photos \
  -F 'type=front_label' \
  -F 'file=@/path/to/new-front.jpg' | jq
```

---

## Guide Endpoint

### `GET /guide.md`

Returns this Markdown guide.

```bash
curl -s http://localhost:8080/guide.md
```
