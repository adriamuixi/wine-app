# TOPROD.md

# Deploy to VPS (Production via SSH)

This guide documents the current production deployment path for this repository.

It is based on the real production stack in:
- `docker-compose.prod.yml`
- `infra/nginx/default.prod.conf`
- `scripts/deploy-prod.sh`

Production in this repo means:
- static frontend builds, not Vite dev servers
- Symfony API running with `APP_ENV=prod`
- PostgreSQL reachable only from the VPS itself (`127.0.0.1:5432`), not publicly
- edge Nginx terminating HTTPS and routing:
  - `/` -> `web-public`
  - `/admin/` -> `web-private`
  - `/api` -> Symfony API

## Included production files

- `docker-compose.prod.yml`
- `apps/api/Dockerfile.prod`
- `apps/web-public/Dockerfile.prod`
- `apps/web-public/nginx.prod.conf`
- `apps/web-private/Dockerfile.prod`
- `apps/web-private/nginx.prod.conf`
- `infra/nginx/Dockerfile.prod`
- `infra/nginx/default.prod.conf`
- `scripts/deploy-prod.sh`
- `scripts/prod-db-backup.sh`

## 1. VPS prerequisites

Minimum recommended:
- 2 vCPU
- 2 GB RAM
- 20+ GB disk

Required software:
- Docker
- Docker Compose plugin
- Git
- SSH access
- a domain name pointing to the VPS
- Let's Encrypt certificates already present on the VPS, or a plan to provision them before the HTTPS stack is considered healthy

Important:
- `infra/nginx/default.prod.conf` is currently hardcoded for `tatirosset.cat` and `www.tatirosset.cat`.
- The same file expects certificates at:
  - `/etc/letsencrypt/live/tatirosset.cat/fullchain.pem`
  - `/etc/letsencrypt/live/tatirosset.cat/privkey.pem`
- If you deploy under another domain, update `infra/nginx/default.prod.conf` before deploying.

## 2. Connect to VPS

```bash
ssh your-user@your-server-ip
```

Or with key:

```bash
ssh -i ~/.ssh/your_key your-user@your-server-ip
```

## 3. Install Docker (Ubuntu)

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Optional, if you want to run Docker without `sudo`:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

Verify:

```bash
docker --version
docker compose version
```

## 4. Pre-deploy checklist

Before the first production deploy, confirm all of these:

1. DNS points your domain to the VPS.
2. `infra/nginx/default.prod.conf` matches your real domain.
3. TLS certificates exist on the VPS under `/etc/letsencrypt`.
4. `/opt/certbot-www` exists on the VPS because the production Nginx container mounts it.
5. You have decided where production secrets will live:
   - `.env` for compose variables
   - optionally `.env.local` for API-only overrides because `api` loads it as an extra env file
6. You understand that AI wine-draft generation requires `OPENAI_API_KEY`.
7. You understand that the private web build can consume `VITE_GEOAPIFY_API_KEY`.

Create the certbot webroot mount if needed:

```bash
sudo mkdir -p /opt/certbot-www
sudo chown "$USER":"$USER" /opt/certbot-www
```

## 5. First production deploy (manual step by step)

### 5.1 Clone project

```bash
mkdir -p ~/apps
cd ~/apps
git clone git@github.com:adriamuixi/wine-app.git
cd wine-app
```

If you use HTTPS instead:

```bash
git clone https://github.com/adriamuixi/wine-app.git
cd wine-app
```

### 5.2 Create `.env`

```bash
cp .env.example .env
nano .env
```

At minimum, review and set:

```env
POSTGRES_DB=wine
POSTGRES_USER=wine
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD
APP_SECRET=CHANGE_ME_STRONG_RANDOM_SECRET
OPENAI_API_KEY=
VITE_GEOAPIFY_API_KEY=
HTTP_PORT=80
HTTPS_PORT=443
```

Notes:
- `.env.example` currently does not include every production key used by `docker-compose.prod.yml`, so add missing values manually.
- `APP_SECRET` is required by the API container in production.
- `OPENAI_API_KEY` is optional only if you do not use AI draft generation.
- `VITE_GEOAPIFY_API_KEY` is passed at build time to `web-private`.

Optional: create `.env.local` if you want API-only overrides loaded by the `api` service:

```bash
nano .env.local
```

### 5.3 Build and start the stack

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 5.4 Run DB migrations

```bash
docker compose -f docker-compose.prod.yml exec api php bin/console doctrine:migrations:migrate --no-interaction
```

### 5.5 Verify containers

```bash
docker compose -f docker-compose.prod.yml ps
```

### 5.6 Verify the live routes

If TLS is already configured and your domain matches the Nginx config:

```bash
curl -I https://YOUR_DOMAIN/
curl -I https://YOUR_DOMAIN/admin/
curl -I https://YOUR_DOMAIN/api
curl -s https://YOUR_DOMAIN/api
```

Expected:
- `/` returns the public site
- `/admin/` returns the private site and includes `X-Robots-Tag`
- `/api` returns JSON health status

## 6. Recommended deploy command

For real updates, prefer the helper script already in the repo:

```bash
./scripts/deploy-prod.sh
```

What it does:
- optionally `git pull --ff-only`
- builds containers
- starts DB first
- waits for DB health
- starts API
- runs DB migrations
- recreates app services
- validates Nginx config
- runs an API health check

Useful variants:

```bash
DO_PULL=0 ./scripts/deploy-prod.sh
APP_URL=https://your-domain.example/api ./scripts/deploy-prod.sh
COMPOSE_FILE=docker-compose.prod.yml ./scripts/deploy-prod.sh
```

This is safer than manually chaining `git pull`, `up`, and `migrate`.

## 7. Manual update deploy

If you prefer to deploy manually:

```bash
ssh your-user@your-server-ip
cd ~/apps/wine-app
git pull --ff-only
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec api php bin/console doctrine:migrations:migrate --no-interaction
docker compose -f docker-compose.prod.yml ps
```

## 8. Operations (useful commands)

### Logs

```bash
docker compose -f docker-compose.prod.yml logs -f nginx
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f web-public
docker compose -f docker-compose.prod.yml logs -f web-private
docker compose -f docker-compose.prod.yml logs -f db
```

### Restart

```bash
docker compose -f docker-compose.prod.yml restart
```

### Stop

```bash
docker compose -f docker-compose.prod.yml down
```

### Rebuild a single service

```bash
docker compose -f docker-compose.prod.yml build api
docker compose -f docker-compose.prod.yml up -d api
```

### Open shell in API container

```bash
docker compose -f docker-compose.prod.yml exec api sh
```

### Validate Nginx config

```bash
docker compose -f docker-compose.prod.yml exec nginx nginx -t
```

## 9. Health and smoke checks

After each deploy, run:

```bash
docker compose -f docker-compose.prod.yml ps
curl -sS -L https://YOUR_DOMAIN/api
curl -sS -I https://YOUR_DOMAIN/
curl -sS -I https://YOUR_DOMAIN/admin/
curl -sS https://YOUR_DOMAIN/robots.txt
```

Recommended additional checks:
- open the public site in a browser
- log into `/admin/`
- create or edit a record that touches the API
- verify one uploaded image is reachable under `/images/...`

## 10. Database backup / restore

### Backup (one-shot, plain SQL)

```bash
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup_$(date +%F_%H%M%S).sql
```

### Backup (recommended script, compressed)

```bash
chmod +x ./scripts/prod-db-backup.sh
./scripts/prod-db-backup.sh
```

The script:
- loads `.env`
- writes compressed backups to `/backup` by default
- keeps 30 backups by default
- removes backups older than 30 days
- avoids concurrent runs with a lock file

### Daily backup cron (30 days / 30 files in `/backup`)

Run once on the production server from repo root:

```bash
mkdir -p /backup
mkdir -p ./logs
chmod +x ./scripts/prod-db-backup.sh
./scripts/prod-db-backup.sh
```

Install cron for the current user, every day at 03:00:

```bash
(crontab -l 2>/dev/null; echo "0 3 * * * cd $(pwd) && ./scripts/prod-db-backup.sh >> ./logs/db-backup.log 2>&1") | crontab -
crontab -l
```

### Restore

```bash
cat backup_file.sql | docker compose -f docker-compose.prod.yml exec -T db psql -U "$POSTGRES_USER" "$POSTGRES_DB"
```

### Restore from compressed `.gz`

```bash
gunzip -c backup_file.sql.gz | docker compose -f docker-compose.prod.yml exec -T db psql -U "$POSTGRES_USER" "$POSTGRES_DB"
```

### Copy uploaded/shared images between servers

```bash
rsync -avz --progress user@SOURCE_SERVER:/path/to/wine-app/shared/public/images/ user@DEST_SERVER:/path/to/wine-app/shared/public/images/
```

Use the whole `shared/public/images/` tree when possible, not only `images/wines/`, because the repo also uses shared icon/DO image paths.

## 11. Rollback notes

There is no automated rollback script in this repo right now.

If a deploy goes wrong:
1. inspect logs first
2. if the problem is code-related, checkout the previous known-good commit
3. rebuild and redeploy from that commit
4. rerun migrations only if the rollback still expects the current schema

Example:

```bash
git log --oneline -n 5
git checkout <known-good-commit>
DO_PULL=0 ./scripts/deploy-prod.sh
```

Be careful with database rollbacks:
- this repo documents forward migrations as the default path
- do not assume every schema change is safely reversible in production

## 12. Firewall (UFW example)

If using UFW:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

## 13. Current production caveats

- The production Nginx config is domain-specific and certificate-path-specific.
- The `db` service is not public, but it is bound to `127.0.0.1:5432` on the VPS host.
- The API container startup command currently creates image directories and applies permissive `0777` permissions inside `shared/public/images`.
- The production compose stack mounts:
  - `./docs` into the API container as read-only
  - `./shared/public/images` into both API and edge Nginx
- AI features require `OPENAI_API_KEY`.
- Private map/geocoding features may depend on `VITE_GEOAPIFY_API_KEY` being present at build time.

## 14. Commands only (copy/paste)

### First deploy

```bash
ssh your-user@your-server-ip
mkdir -p ~/apps && cd ~/apps
git clone git@github.com:adriamuixi/wine-app.git
cd wine-app
cp .env.example .env
nano .env
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec api php bin/console doctrine:migrations:migrate --no-interaction
docker compose -f docker-compose.prod.yml ps
```

### Update deploy

```bash
ssh your-user@your-server-ip
cd ~/apps/wine-app
git pull --ff-only
./scripts/deploy-prod.sh
```

## 15. Dev compose vs prod compose

The root `docker-compose.yml` is still development-oriented:
- Vite dev servers
- bind mounts
- `APP_ENV=dev`

For VPS production, use:

```bash
docker compose -f docker-compose.prod.yml ...
```
