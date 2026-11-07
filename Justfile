## `Justfile` (único)

set dotenv-load := true
set export := true

compose := "docker compose"

# =========================
# Docker lifecycle
# =========================

up:
    {{ compose }} up -d --build

down:
    {{ compose }} down

restart:
    {{ compose }} down
    {{ compose }} up -d --build

ps:
    {{ compose }} ps

logs *args:
    {{ compose }} logs -f {{ args }}

sh service="api":
    {{ compose }} exec {{ service }} sh

# =========================
# Composer (API container)
# =========================

composer *args:
    {{ compose }} exec api composer {{ args }}

backend-install:
    {{ compose }} exec api composer install

# =========================
# Symfony Console (API)
# =========================

console *args:
    {{ compose }} exec api php bin/console {{ args }}

cache-clear:
    {{ compose }} exec api php bin/console cache:clear

# =========================
# Doctrine
# =========================

db-create:
    {{ compose }} exec api php bin/console doctrine:database:create --if-not-exists

migrate:
    {{ compose }} exec api php bin/console doctrine:migrations:migrate --no-interaction

migrations-diff:
    {{ compose }} exec api php bin/console doctrine:migrations:diff

schema-validate:
    {{ compose }} exec api php bin/console doctrine:schema:validate

# =========================
# Frontends
# =========================

public-install:
    {{ compose }} exec web-public npm ci

private-install:
    {{ compose }} exec web-private npm ci

public-build:
    {{ compose }} exec web-public npm run build

private-build:
    {{ compose }} exec web-private npm run build

# Local Vite (hosted on LAN)
public-dev-host port="4173":
    npm --prefix apps/web-public run dev -- --host 0.0.0.0 --port {{ port }}

private-dev-host port="4174":
    npm --prefix apps/web-private run dev -- --host 0.0.0.0 --port {{ port }}

# =========================
# Bootstrap everything
# =========================
setup:
    just up
    just backend-install
    just db-create
    just migrate
    just public-install
    just private-install
    # npm ci above reinstalls node_modules while Vite is already running,
    # which desyncs its dep-optimizer cache and breaks the dev server. Restart
    # so Vite boots fresh against the installed node_modules. nginx resolves
    # web-public/web-private to fixed IPs at startup (no resolver directive),
    # so it must restart too or it keeps proxying to the pre-restart IPs.
    {{ compose }} restart web-public web-private
    {{ compose }} restart nginx

health:
    #!/usr/bin/env bash
    set -uo pipefail
    ok=0
    check() {
      for _ in 1 2 3 4 5 6; do
        curl -fsS -o /dev/null --max-time 5 "$2" && { echo "OK    $1  $2"; return 0; }
        sleep 2
      done
      echo "FAIL  $1  $2"
      ok=1
    }
    check "Public " http://localhost:8080/
    check "Private" http://localhost:8080/admin/
    check "API    " http://localhost:8080/api
    exit "$ok"

# =========================
# Production (VPS)
# =========================

# Run on the VPS: pulls, builds, migrates and healthchecks via scripts/deploy-prod.sh
# dotenv-load + export would leak just's own parse of .env into the shell env,
# which compose prefers over .env; values with $, quotes or # then differ
# (e.g. POSTGRES_PASSWORD). Unset them so compose reads .env itself.
deploy:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -f .env ]]; then
      unset $(sed -nE 's/^[[:space:]]*(export[[:space:]]+)?([A-Za-z_][A-Za-z0-9_]*)=.*/\2/p' .env)
    fi
    exec ./scripts/deploy-prod.sh

# =========================
# Mobile (host commands)
# =========================

mobile-install:
    npm --prefix apps/mobile install

mobile-start:
    npm --prefix apps/mobile run start

mobile-android:
    npm --prefix apps/mobile run android

mobile-ios:
    npm --prefix apps/mobile run ios

mobile-web:
    npm --prefix apps/mobile run web

mobile-lint:
    npm --prefix apps/mobile run lint

mobile-test:
    npm --prefix apps/mobile run test

mobile-typecheck:
    npm --prefix apps/mobile run typecheck

mobile-prebuild:
    npm --prefix apps/mobile run prebuild

mobile-eas-local-check:
    npm --prefix apps/mobile run eas:local:check
