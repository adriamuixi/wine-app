#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
DO_PULL="${DO_PULL:-1}"
NGINX_PROD_CONF="${NGINX_PROD_CONF:-infra/nginx/default.prod.conf}"

resolve_default_health_host() {
  local config_path="$1"

  if [[ ! -f "$config_path" ]]; then
    return 1
  fi

  awk '
    $1 == "server_name" {
      for (i = 2; i <= NF; i++) {
        gsub(/;/, "", $i)
        if ($i != "" && $i != "_") {
          print $i
          exit
        }
      }
    }
  ' "$config_path"
}

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

DEFAULT_HEALTH_HOST="$(resolve_default_health_host "$ROOT_DIR/$NGINX_PROD_CONF" || true)"
if [[ -n "$DEFAULT_HEALTH_HOST" ]]; then
  APP_URL="${APP_URL:-https://${DEFAULT_HEALTH_HOST}/api}"
else
  APP_URL="${APP_URL:-http://localhost/api}"
fi

echo "==> Deploy root: $ROOT_DIR"
echo "==> Compose file: $COMPOSE_FILE"
echo "==> Healthcheck URL: $APP_URL"

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

echo "==> Start API for migrations"
docker compose -f "$COMPOSE_FILE" up -d api

echo "==> Wait for API container"
for i in {1..30}; do
  api_status="$(docker inspect -f '{{.State.Status}}' wine_api_prod 2>/dev/null || true)"
  if [[ "$api_status" == "running" ]]; then
    break
  fi
  sleep 2
done

echo "==> Run DB migrations"
docker compose -f "$COMPOSE_FILE" exec -T api php bin/console doctrine:migrations:migrate --no-interaction

echo "==> Recreate app services"
docker compose -f "$COMPOSE_FILE" up -d --force-recreate api web-public web-private nginx

echo "==> Healthcheck API"
# Follow redirects because production nginx enforces HTTP -> HTTPS.
curl_args=(-sS -L -o /tmp/wine_api_health.json -w '%{http_code}')
if [[ "$APP_URL" =~ ^https?://([^/:]+) ]]; then
  health_host="${BASH_REMATCH[1]}"
  if [[ "$health_host" != "localhost" && "$health_host" != "127.0.0.1" ]]; then
    if [[ "$APP_URL" =~ ^https:// ]]; then
      curl_args+=(--resolve "${health_host}:443:127.0.0.1")
    else
      curl_args+=(--resolve "${health_host}:80:127.0.0.1")
    fi
  fi
fi

HTTP_CODE=""
LAST_CURL_ERROR=""
for i in {1..20}; do
  if HTTP_CODE="$(curl "${curl_args[@]}" "$APP_URL" 2>/tmp/wine_api_health.err)"; then
    if [[ "$HTTP_CODE" == "200" ]]; then
      break
    fi
  fi

  LAST_CURL_ERROR="$(cat /tmp/wine_api_health.err 2>/dev/null || true)"
  sleep 2
done

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "ERROR: API healthcheck failed with HTTP ${HTTP_CODE:-curl_error}" >&2
  if [[ -n "$LAST_CURL_ERROR" ]]; then
    echo "curl error: $LAST_CURL_ERROR" >&2
  fi
  echo "Recent nginx logs:" >&2
  docker compose -f "$COMPOSE_FILE" logs --tail=80 nginx >&2
  echo "Recent API logs:" >&2
  docker compose -f "$COMPOSE_FILE" logs --tail=80 api >&2
  exit 1
fi

echo "==> API response"
cat /tmp/wine_api_health.json
echo

echo "==> Deploy completed successfully"
