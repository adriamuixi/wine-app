#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
APP_URL="${APP_URL:-http://localhost/api}"
DO_PULL="${DO_PULL:-1}"

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker is not installed." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: docker compose plugin is not available." >&2
  exit 1
fi

cd "$ROOT_DIR"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "ERROR: compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi

echo "==> Deploy root: $ROOT_DIR"
echo "==> Compose file: $COMPOSE_FILE"

if [[ "$DO_PULL" == "1" ]]; then
  echo "==> Pull latest changes"
  git pull --ff-only
fi

echo "==> Build containers"
docker compose -f "$COMPOSE_FILE" build

echo "==> Start database first"
docker compose -f "$COMPOSE_FILE" up -d db

echo "==> Wait for DB health"
for i in {1..30}; do
  status="$(docker inspect -f '{{.State.Health.Status}}' wine_db_prod 2>/dev/null || true)"
  if [[ "$status" == "healthy" ]]; then
    break
  fi
  sleep 2
done

echo "==> Run DB migrations"
docker compose -f "$COMPOSE_FILE" exec -T api php bin/console doctrine:migrations:migrate --no-interaction

echo "==> Recreate app services"
docker compose -f "$COMPOSE_FILE" up -d --force-recreate api web-public web-private nginx

echo "==> Healthcheck API"
HTTP_CODE="$(curl -s -o /tmp/wine_api_health.json -w '%{http_code}' "$APP_URL")"
if [[ "$HTTP_CODE" != "200" ]]; then
  echo "ERROR: API healthcheck failed with HTTP $HTTP_CODE" >&2
  echo "Recent API logs:" >&2
  docker compose -f "$COMPOSE_FILE" logs --tail=80 api >&2
  exit 1
fi

echo "==> API response"
cat /tmp/wine_api_health.json
echo

echo "==> Deploy completed successfully"
