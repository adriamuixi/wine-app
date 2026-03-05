#!/usr/bin/env bash
set -euo pipefail

# WARNING: This script is destructive for the LOCAL database.
# It will:
#   1) reset local public schema
#   2) run local migrations
#   3) import remote data (data-only dump) over SSH
#
# Defaults are aligned with current wine-app setup.
#
# Usage:
#   scripts/sync-db-from-server.sh
#   REMOTE_HOST=212.227.20.31 scripts/sync-db-from-server.sh
#   SSH_PORT=2222 scripts/sync-db-from-server.sh
#
# Optional environment variables:
#   REMOTE_HOST            default: 212.227.20.31
#   REMOTE_USER            default: root
#   SSH_PORT               default: 22
#   REMOTE_PROJECT_DIR     default: /root/apps/wine-app
#   REMOTE_COMPOSE_FILE    default: docker-compose.prod.yml
#   REMOTE_DB_SERVICE      default: db
#   REMOTE_POSTGRES_DB     default: wine
#   REMOTE_POSTGRES_USER   default: wine
#
#   LOCAL_PROJECT_DIR      default: repo root
#   LOCAL_COMPOSE_FILE     default: docker-compose.yml
#   LOCAL_DB_SERVICE       default: db
#   LOCAL_API_SERVICE      default: api
#   LOCAL_POSTGRES_DB      default: POSTGRES_DB from .env or wine
#   LOCAL_POSTGRES_USER    default: POSTGRES_USER from .env or wine

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_PROJECT_DIR="${LOCAL_PROJECT_DIR:-$(cd "${SCRIPT_DIR}/.." && pwd)}"

REMOTE_HOST="${REMOTE_HOST:-212.227.20.31}"
REMOTE_USER="${REMOTE_USER:-root}"
SSH_PORT="${SSH_PORT:-22}"
REMOTE_PROJECT_DIR="${REMOTE_PROJECT_DIR:-/root/apps/wine-app}"
REMOTE_COMPOSE_FILE="${REMOTE_COMPOSE_FILE:-docker-compose.prod.yml}"
REMOTE_DB_SERVICE="${REMOTE_DB_SERVICE:-db}"
REMOTE_POSTGRES_DB="${REMOTE_POSTGRES_DB:-wine}"
REMOTE_POSTGRES_USER="${REMOTE_POSTGRES_USER:-wine}"

LOCAL_COMPOSE_FILE="${LOCAL_COMPOSE_FILE:-${LOCAL_PROJECT_DIR}/docker-compose.yml}"
LOCAL_DB_SERVICE="${LOCAL_DB_SERVICE:-db}"
LOCAL_API_SERVICE="${LOCAL_API_SERVICE:-api}"
LOCAL_POSTGRES_DB="${LOCAL_POSTGRES_DB:-}"
LOCAL_POSTGRES_USER="${LOCAL_POSTGRES_USER:-}"

if [[ ! -f "${LOCAL_COMPOSE_FILE}" ]]; then
  echo "ERROR: local compose file not found: ${LOCAL_COMPOSE_FILE}"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker is not installed."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: docker compose plugin is not available."
  exit 1
fi

# Load local .env if present to get POSTGRES_* defaults.
if [[ -f "${LOCAL_PROJECT_DIR}/.env" ]]; then
  while IFS= read -r raw_line || [[ -n "${raw_line}" ]]; do
    line="${raw_line%$'\r'}"
    [[ -z "${line}" ]] && continue
    [[ "${line}" =~ ^[[:space:]]*# ]] && continue
    [[ "${line}" != *=* ]] && continue

    key="${line%%=*}"
    value="${line#*=}"
    key="$(printf '%s' "${key}" | xargs)"
    [[ -z "${key}" ]] && continue

    if [[ "${value}" =~ ^\".*\"$ ]]; then
      value="${value:1:${#value}-2}"
    elif [[ "${value}" =~ ^\'.*\'$ ]]; then
      value="${value:1:${#value}-2}"
    fi

    export "${key}=${value}"
  done < "${LOCAL_PROJECT_DIR}/.env"
fi

LOCAL_POSTGRES_DB="${LOCAL_POSTGRES_DB:-${POSTGRES_DB:-wine}}"
LOCAL_POSTGRES_USER="${LOCAL_POSTGRES_USER:-${POSTGRES_USER:-wine}}"

echo "==> Remote source: ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PROJECT_DIR}"
echo "==> Local compose: ${LOCAL_COMPOSE_FILE}"
echo "==> Local DB: ${LOCAL_POSTGRES_DB} (user: ${LOCAL_POSTGRES_USER})"
echo "==> This will DELETE local DB data and replace it."

cd "${LOCAL_PROJECT_DIR}"

echo "==> Ensure local db + api are up"
docker compose -f "${LOCAL_COMPOSE_FILE}" up -d "${LOCAL_DB_SERVICE}" "${LOCAL_API_SERVICE}"

echo "==> Reset local public schema"
docker compose -f "${LOCAL_COMPOSE_FILE}" exec -T "${LOCAL_DB_SERVICE}" \
  psql -v ON_ERROR_STOP=1 -U "${LOCAL_POSTGRES_USER}" -d "${LOCAL_POSTGRES_DB}" \
  -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;"

echo "==> Run local migrations"
docker compose -f "${LOCAL_COMPOSE_FILE}" exec -T "${LOCAL_API_SERVICE}" \
  php bin/console doctrine:migrations:migrate --no-interaction

echo "==> Clear local data tables (keep doctrine migration metadata)"
docker compose -f "${LOCAL_COMPOSE_FILE}" exec -T "${LOCAL_DB_SERVICE}" \
  psql -v ON_ERROR_STOP=1 -U "${LOCAL_POSTGRES_USER}" -d "${LOCAL_POSTGRES_DB}" \
  <<'SQL'
DO $$
DECLARE
  truncate_stmt text;
BEGIN
  SELECT
    CASE
      WHEN count(*) = 0 THEN NULL
      ELSE 'TRUNCATE TABLE '
           || string_agg(format('%I.%I', schemaname, tablename), ', ')
           || ' RESTART IDENTITY CASCADE'
    END
  INTO truncate_stmt
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename <> 'doctrine_migration_versions';

  IF truncate_stmt IS NOT NULL THEN
    EXECUTE truncate_stmt;
  END IF;
END $$;
SQL

echo "==> Import remote data-only dump"
ssh -p "${SSH_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" \
  "set -euo pipefail; cd '${REMOTE_PROJECT_DIR}'; docker compose -f '${REMOTE_COMPOSE_FILE}' exec -T '${REMOTE_DB_SERVICE}' pg_dump -U '${REMOTE_POSTGRES_USER}' -d '${REMOTE_POSTGRES_DB}' --data-only --no-owner --no-privileges --disable-triggers --exclude-table=public.doctrine_migration_versions" \
  | docker compose -f "${LOCAL_COMPOSE_FILE}" exec -T "${LOCAL_DB_SERVICE}" \
      psql -v ON_ERROR_STOP=1 -1 -U "${LOCAL_POSTGRES_USER}" -d "${LOCAL_POSTGRES_DB}"

echo "==> Verify FK triggers are enabled"
disabled_fk_triggers="$(
  docker compose -f "${LOCAL_COMPOSE_FILE}" exec -T "${LOCAL_DB_SERVICE}" \
    psql -v ON_ERROR_STOP=1 -U "${LOCAL_POSTGRES_USER}" -d "${LOCAL_POSTGRES_DB}" -At \
      -c "SELECT format('%I.%I:%s', n.nspname, c.relname, t.tgname)
          FROM pg_trigger t
          JOIN pg_class c ON c.oid = t.tgrelid
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = 'public'
            AND t.tgisinternal
            AND t.tgname LIKE 'RI_ConstraintTrigger_%'
            AND t.tgenabled <> 'O'
          ORDER BY n.nspname, c.relname, t.tgname;"
)"

if [[ -n "${disabled_fk_triggers}" ]]; then
  echo "ERROR: some FK triggers are disabled after import:"
  echo "${disabled_fk_triggers}"
  exit 1
fi

echo "==> Done. Local database synced from server."
