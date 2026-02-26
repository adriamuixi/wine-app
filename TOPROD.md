# TOPROD.md

# Deploy on VPS (SSH) - Step by Step

This guide explains how to deploy the **current project** on a VPS using **SSH** and **Docker Compose**.

Important:
- The current `docker-compose.yml` is **development-oriented**:
  - `api` runs with `APP_ENV=dev`
  - `web-public` and `web-private` run **Vite dev servers**
  - source code is mounted as volumes
- You can still deploy it on a VPS for staging/private use, but for real production traffic you should harden it later.

## 1. Prerequisites (VPS)

You need a VPS (Ubuntu recommended) with:
- SSH access (`root` or sudo user)
- Public IP
- Domain or subdomain (optional but recommended)
- Docker + Docker Compose plugin installed

Recommended VPS size (minimum):
- 2 vCPU
- 2 GB RAM
- 20+ GB disk

## 2. Connect to the VPS

From your local machine:

```bash
ssh your-user@your-server-ip
```

If you use a custom SSH key:

```bash
ssh -i ~/.ssh/your_key your-user@your-server-ip
```

## 3. Install Docker (Ubuntu)

If Docker is not installed:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Optional (run Docker without `sudo`):

```bash
sudo usermod -aG docker $USER
newgrp docker
```

Verify:

```bash
docker --version
docker compose version
```

## 4. Prepare the server folder

Create a folder for the project:

```bash
mkdir -p ~/apps
cd ~/apps
```

## 5. Clone the repository

Using HTTPS:

```bash
git clone https://github.com/adriamuixi/wine-app wine-app
cd wine-app
```

Using SSH (recommended if you have deploy keys):

```bash
git clone git@github.com:adriamuixi/wine-app.git wine-app
cd wine-app
```

## 6. Create `.env`

This project uses root-level `.env` values for PostgreSQL.

Start from the example:

```bash
cp .env.example .env
```

Edit it:

```bash
nano .env
```

At minimum set strong DB credentials:

```env
POSTGRES_DB=wine
POSTGRES_USER=wine
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD
```

## 7. Start the stack (current setup)

Build and start all services:

```bash
docker compose up -d --build
```

This starts:
- `db` (PostgreSQL)
- `api` (PHP-FPM Symfony)
- `web-public` (Vite dev server)
- `web-private` (Vite dev server)
- `nginx` (entrypoint, exposed on port `8080`)

## 8. Install dependencies inside containers (first deploy)

API (Composer):

```bash
docker compose exec api composer install
```

Web apps (NPM):

```bash
docker compose exec web-public npm ci
docker compose exec web-private npm ci
```

## 9. Initialize database

Create DB (if needed):

```bash
docker compose exec api php bin/console doctrine:database:create --if-not-exists
```

Run migrations:

```bash
docker compose exec api php bin/console doctrine:migrations:migrate --no-interaction
```

## 10. Check that everything is running

Container status:

```bash
docker compose ps
```

Open logs if something fails:

```bash
docker compose logs -f nginx
docker compose logs -f api
docker compose logs -f web-public
docker compose logs -f web-private
```

Default URLs (current compose):
- Public app: `http://YOUR_SERVER_IP:8080/`
- Private app: `http://YOUR_SERVER_IP:8080/admin/`
- API: `http://YOUR_SERVER_IP:8080/api`

## 11. Open firewall ports

If using UFW:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 8080/tcp
sudo ufw enable
sudo ufw status
```

Optional (recommended later):
- Put this behind HTTPS reverse proxy and expose `80/443` instead of `8080`.

## 12. Update / redeploy workflow (next deployments)

From the VPS project folder:

```bash
cd ~/apps/wine-app
git pull
docker compose up -d --build
docker compose exec api composer install
docker compose exec web-public npm ci
docker compose exec web-private npm ci
docker compose exec api php bin/console doctrine:migrations:migrate --no-interaction
```

## 13. Useful commands

Restart everything:

```bash
docker compose restart
```

Stop everything:

```bash
docker compose down
```

Stop and remove volumes (danger: deletes DB data):

```bash
docker compose down -v
```

Enter API shell:

```bash
docker compose exec api sh
```

## 14. Backups (database)

Create a DB backup:

```bash
docker compose exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup_$(date +%F_%H%M%S).sql
```

Restore a DB backup:

```bash
cat backup_file.sql | docker compose exec -T db psql -U "$POSTGRES_USER" "$POSTGRES_DB"
```

## 15. Current production caveats (important)

The current compose works, but for a real production deployment you should change:

1. `web-public` / `web-private` should serve built static files (not Vite dev servers).
2. `api` should use `APP_ENV=prod`.
3. Remove development bind mounts in production.
4. Add HTTPS (Nginx + Let's Encrypt / reverse proxy).
5. Add persistent backup strategy for PostgreSQL volume.
6. Add healthchecks and restart policies.
7. Restrict DB port `5432` (currently exposed publicly by compose).

## 16. Suggested next step (production-ready compose)

Create a separate file, for example:
- `docker-compose.prod.yml`

And configure:
- built frontend assets served by Nginx
- Symfony `APP_ENV=prod`
- no source mounts
- only `80/443` exposed
- `db` not exposed publicly

If you want, I can create that `docker-compose.prod.yml` and a production Nginx config next.

## 17. Production Compose (now included)

This repository now includes:
- `docker-compose.prod.yml`
- `apps/api/Dockerfile.prod`
- `apps/web-public/Dockerfile.prod`
- `apps/web-private/Dockerfile.prod`
- `infra/nginx/Dockerfile.prod`
- `infra/nginx/default.prod.conf`

### Start production stack

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Run migrations (production)

```bash
docker compose -f docker-compose.prod.yml exec api php bin/console doctrine:migrations:migrate --no-interaction
```

### Check status

```bash
docker compose -f docker-compose.prod.yml ps
```

### Logs

```bash
docker compose -f docker-compose.prod.yml logs -f nginx
docker compose -f docker-compose.prod.yml logs -f api
```

### Notes about this production compose

- `db` is **not exposed publicly**.
- `api` runs with `APP_ENV=prod`.
- Frontends are built and served as static files by Nginx containers (no Vite dev server).
- Main `nginx` proxies:
  - `/` -> `web-public`
  - `/admin/` -> `web-private`
  - `/api` -> `api`

### Recommended `.env` additions for production

Add this to your root `.env` on the VPS:

```env
APP_SECRET=CHANGE_ME_STRONG_RANDOM_SECRET
HTTP_PORT=80
```

## 18. Production Deploy (Commands Only)

### First deploy

```bash
ssh your-user@your-server-ip
cd ~/apps
git clone <YOUR_REPO_URL> wine-app
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
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec api php bin/console doctrine:migrations:migrate --no-interaction
docker compose -f docker-compose.prod.yml ps
```

### Logs

```bash
docker compose -f docker-compose.prod.yml logs -f nginx
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f web-public
docker compose -f docker-compose.prod.yml logs -f web-private
```

### Restart / stop

```bash
docker compose -f docker-compose.prod.yml restart
docker compose -f docker-compose.prod.yml down
```

### Backup DB

```bash
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup_$(date +%F_%H%M%S).sql
```
