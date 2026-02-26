# TOPROD.md

# Deploy to VPS (Production via SSH)

This guide is for deploying the project on a VPS using the **production stack**:
- `docker-compose.prod.yml`
- static frontends (no Vite dev server)
- `APP_ENV=prod`
- PostgreSQL not exposed publicly

## Included production files

- `docker-compose.prod.yml`
- `apps/api/Dockerfile.prod`
- `apps/web-public/Dockerfile.prod`
- `apps/web-public/nginx.prod.conf`
- `apps/web-private/Dockerfile.prod`
- `apps/web-private/nginx.prod.conf`
- `infra/nginx/Dockerfile.prod`
- `infra/nginx/default.prod.conf`

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

Optional (run Docker without sudo):

```bash
sudo usermod -aG docker $USER
newgrp docker
```

Verify:

```bash
docker --version
docker compose version
```

## 4. First production deploy (step by step)

### 4.1 Clone project

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

### 4.2 Create `.env`

```bash
cp .env.example .env
nano .env
```

Set at least:

```env
POSTGRES_DB=wine
POSTGRES_USER=wine
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD
APP_SECRET=CHANGE_ME_STRONG_RANDOM_SECRET
HTTP_PORT=80
```

### 4.3 Start production stack

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 4.4 Run DB migrations

```bash
docker compose -f docker-compose.prod.yml exec api php bin/console doctrine:migrations:migrate --no-interaction
```

### 4.5 Verify services

```bash
docker compose -f docker-compose.prod.yml ps
```

Public URLs:
- Public app: `http://YOUR_SERVER_IP/`
- Private app: `http://YOUR_SERVER_IP/admin/`
- API: `http://YOUR_SERVER_IP/api`

## 5. Update deploy (new version)

```bash
ssh your-user@your-server-ip
cd ~/apps/wine-app
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec api php bin/console doctrine:migrations:migrate --no-interaction
docker compose -f docker-compose.prod.yml ps
```

## 6. Operations (useful commands)

### Logs

```bash
docker compose -f docker-compose.prod.yml logs -f nginx
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f web-public
docker compose -f docker-compose.prod.yml logs -f web-private
```

### Restart

```bash
docker compose -f docker-compose.prod.yml restart
```

### Stop

```bash
docker compose -f docker-compose.prod.yml down
```

### Open shell in API container

```bash
docker compose -f docker-compose.prod.yml exec api sh
```

## 7. Database backup / restore

### Backup

```bash
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup_$(date +%F_%H%M%S).sql
```

### Restore

```bash
cat backup_file.sql | docker compose -f docker-compose.prod.yml exec -T db psql -U "$POSTGRES_USER" "$POSTGRES_DB"
```

## 8. Firewall (UFW example)

If using UFW:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw enable
sudo ufw status
```

## 9. Notes

- `db` is internal only in production compose (not exposed on host).
- `api` runs with `APP_ENV=prod`.
- Frontends are built and served as static assets.
- Main nginx routes:
  - `/` -> `web-public`
  - `/admin/` -> `web-private`
  - `/api` -> Symfony API

## 10. Commands only (copy/paste)

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
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec api php bin/console doctrine:migrations:migrate --no-interaction
docker compose -f docker-compose.prod.yml ps
```

## 11. Dev compose (important distinction)

The root `docker-compose.yml` is still **development-oriented**:
- Vite dev servers
- bind mounts
- `APP_ENV=dev`

For VPS production, use:

```bash
docker compose -f docker-compose.prod.yml ...
```

