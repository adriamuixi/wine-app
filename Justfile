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

health:
    @echo "Public:  http://localhost:8080/"
    @echo "Private: http://localhost:8080/admin/"
    @echo "API:     http://localhost:8080/api"
