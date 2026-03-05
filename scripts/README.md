# Scripts

Operational helper scripts for this repository.

## Index

- `scripts/deploy-prod.sh`: production deploy with Docker Compose.
- `scripts/prod-db-backup.sh`: PostgreSQL backup from production compose stack.
- `scripts/sync-wines-images.sh`: sync wine images from server to local folder.
- `scripts/sync-db-from-server.sh`: reset local DB, migrate, and import remote data.
- `scripts/sql/import_vinos_tat_i_rosset.sql`: one-shot SQL dataset import.

## `deploy-prod.sh`

Purpose:

- Deploy the production stack using `docker-compose.prod.yml`.
- Optionally run `git pull`.
- Build and recreate containers.
- Run DB migrations.
- Perform API healthcheck.

Default flow:

1. `git pull --ff-only` (if `DO_PULL=1`)
2. `docker compose ... build`
3. `docker compose ... up -d db`
4. wait for DB health
5. `php bin/console doctrine:migrations:migrate --no-interaction`
6. recreate `api`, `web-public`, `web-private`, `nginx`
7. curl healthcheck

Usage:

```bash
scripts/deploy-prod.sh
```

Important environment variables:

- `COMPOSE_FILE` (default: `docker-compose.prod.yml`)
- `APP_URL` (default: `http://localhost/api`)
- `DO_PULL` (default: `1`, set `0` to skip `git pull`)

Example:

```bash
DO_PULL=0 APP_URL=https://your-domain/api scripts/deploy-prod.sh
```

## `prod-db-backup.sh`

Purpose:

- Create compressed PostgreSQL backups (`pg_dump | gzip`) from production DB container.
- Keep backups with time and count retention.
- Prevent concurrent runs with a lock file.

Backup file pattern:

- `wine_db_YYYYMMDDTHHMMSSZ.sql.gz`

Usage:

```bash
scripts/prod-db-backup.sh
```

Important environment variables:

- `BACKUP_DIR` (default: `/backup`)
- `RETENTION_DAYS` (default: `30`)
- `MAX_BACKUPS` (default: `30`)
- `LOCK_FILE` (default: `/tmp/wine-prod-db-backup.lock`)

Notes:

- Reads `POSTGRES_DB` and `POSTGRES_USER` from project `.env` when present.
- Uses `docker-compose.prod.yml`.

Cron example (daily 02:30):

```cron
30 2 * * * /home/adria/dev/wine-app/scripts/prod-db-backup.sh >> /home/adria/dev/wine-app/scripts/prod-db-backup.log 2>&1
```

## `sync-wines-images.sh`

Purpose:

- Pull images from server path:
  - `/root/apps/wine-app/shared/public/images/wines/`
- Into local path:
  - `/home/adria/dev/wine-app/shared/public/images/wines/`

Uses:

- `rsync` over SSH with `--delete` (local mirror of remote).

### 1. Prepare SSH access

The local machine must be able to connect with SSH to the server.

Recommended:

```bash
ssh-copy-id root@212.227.20.31
```

### 2. Make the script executable

```bash
chmod +x scripts/sync-wines-images.sh
```

### 3. Manual test

```bash
scripts/sync-wines-images.sh
```

Dry run (no changes written):

```bash
DRY_RUN=1 scripts/sync-wines-images.sh
```

### 4. Weekly cron (on local machine)

Open your local crontab:

```bash
crontab -e
```

Run every Sunday at 03:00:

```cron
0 3 * * 0 /home/adria/dev/wine-app/scripts/sync-wines-images.sh >> /home/adria/dev/wine-app/scripts/sync-wines-images.log 2>&1
```

Optional environment variables:

- `REMOTE_USER` (default: `root`)
- `REMOTE_PATH` (default: `/root/apps/wine-app/shared/public/images/wines/`)
- `LOCAL_PATH` (default: `/home/adria/dev/wine-app/shared/public/images/wines/`)
- `SSH_PORT` (default: `22`)
- `DRY_RUN` (default: `0`)

Custom SSH port example:

```bash
REMOTE_HOST=212.227.20.31 SSH_PORT=2222 scripts/sync-wines-images.sh
```

## `sync-db-from-server.sh`

Purpose:

- Replace your local DB data with server data.
- Keep local schema aligned by running local migrations before importing.

What it does:

1. Starts local `db` and `api` services (docker compose local file).
2. Drops and recreates local `public` schema (destructive).
3. Runs local Doctrine migrations.
4. Truncates all local data tables in `public` except `doctrine_migration_versions`.
5. Streams a remote `pg_dump --data-only` over SSH.
6. Imports into local PostgreSQL.

Tables excluded from remote import:

- `doctrine_migration_versions`: migration metadata.

Notes on FK/order:

- The import uses `pg_dump --data-only --disable-triggers`, which is the standard approach for FK-heavy datasets.
- Because local tables are truncated before import, `place`, `wine_award`, `wine_purchase`, etc. are imported from production and remain consistent with prod data.

Default remote source:

- Host: `212.227.20.31`
- User: `root`
- Project dir: `/root/apps/wine-app`
- Compose file: `docker-compose.prod.yml`

Usage:

```bash
chmod +x scripts/sync-db-from-server.sh
scripts/sync-db-from-server.sh
```

Custom SSH port:

```bash
SSH_PORT=2222 scripts/sync-db-from-server.sh
```

Custom remote/local overrides:

```bash
REMOTE_HOST=212.227.20.31 REMOTE_USER=root LOCAL_POSTGRES_DB=wine LOCAL_POSTGRES_USER=wine scripts/sync-db-from-server.sh
```

Important environment variables:

- `REMOTE_HOST` (default: `212.227.20.31`)
- `REMOTE_USER` (default: `root`)
- `SSH_PORT` (default: `22`)
- `REMOTE_PROJECT_DIR` (default: `/root/apps/wine-app`)
- `REMOTE_COMPOSE_FILE` (default: `docker-compose.prod.yml`)
- `REMOTE_DB_SERVICE` (default: `db`)
- `REMOTE_POSTGRES_DB` (default: `wine`)
- `REMOTE_POSTGRES_USER` (default: `wine`)
- `LOCAL_COMPOSE_FILE` (default: `<repo>/docker-compose.yml`)
- `LOCAL_DB_SERVICE` (default: `db`)
- `LOCAL_API_SERVICE` (default: `api`)
- `LOCAL_POSTGRES_DB` (default: `POSTGRES_DB` from local `.env`, fallback `wine`)
- `LOCAL_POSTGRES_USER` (default: `POSTGRES_USER` from local `.env`, fallback `wine`)

Warning:

- This script deletes all local data in the target DB schema before import.

## `sql/import_vinos_tat_i_rosset.sql`

Purpose:

- SQL seed/import file for wine data and related entities.
- Inserts into tables like `wine`, `wine_grape`, `place`, `wine_purchase`, `review`.

Notes:

- It is a static/manual import script (not a migration).
- It assumes specific reference IDs already exist (users, DO, grape IDs).
- Run only in environments where those IDs are valid.

Example execution (inside DB container):

```bash
docker compose exec -T db psql -U wine -d wine < scripts/sql/import_vinos_tat_i_rosset.sql
```
