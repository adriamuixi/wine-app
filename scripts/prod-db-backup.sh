#!/usr/bin/env bash
set -euo pipefail

umask 077

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
COMPOSE_FILE="${PROJECT_ROOT}/docker-compose.prod.yml"

BACKUP_DIR="${BACKUP_DIR:-/backup}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
MAX_BACKUPS="${MAX_BACKUPS:-30}"
LOCK_FILE="${LOCK_FILE:-/tmp/wine-prod-db-backup.lock}"

mkdir -p "${BACKUP_DIR}"

exec 9>"${LOCK_FILE}"
if ! flock -n 9; then
  echo "Backup already running. Exiting."
  exit 0
fi

if [[ -f "${PROJECT_ROOT}/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${PROJECT_ROOT}/.env"
  set +a
fi

POSTGRES_DB="${POSTGRES_DB:-wine}"
POSTGRES_USER="${POSTGRES_USER:-wine}"

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_file="${BACKUP_DIR}/wine_db_${timestamp}.sql.gz"

docker compose -f "${COMPOSE_FILE}" exec -T db \
  pg_dump -U "${POSTGRES_USER}" "${POSTGRES_DB}" \
  | gzip -9 > "${backup_file}"

gzip -t "${backup_file}"

# Delete backups older than RETENTION_DAYS.
find "${BACKUP_DIR}" \
  -maxdepth 1 \
  -type f \
  -name 'wine_db_*.sql.gz' \
  -mtime +"${RETENTION_DAYS}" \
  -delete

# Keep at most MAX_BACKUPS newest files.
mapfile -t backup_files < <(ls -1t "${BACKUP_DIR}"/wine_db_*.sql.gz 2>/dev/null || true)
if (( ${#backup_files[@]} > MAX_BACKUPS )); then
  for old_file in "${backup_files[@]:MAX_BACKUPS}"; do
    rm -f -- "${old_file}"
  done
fi

echo "Backup created: ${backup_file}"
