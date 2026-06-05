# Multi-Site VPS — tatirosset.cat + pcfutbolsala.com

This document extends `TOPROD.md` for the scenario where **both wine-app (tatirosset.cat) and pc_futbol_sala (pcfutbolsala.com) run on the same VPS**.

Each app keeps its own internal Docker Nginx. A host-level Nginx (installed directly on the VPS, not in Docker) acts as the shared reverse proxy handling SSL termination and domain routing.

## Architecture

```
Internet :80/:443
    └── Host Nginx  (apt-installed on VPS — handles SSL for all domains)
          ├── tatirosset.cat    →  wine-app  Docker nginx  (127.0.0.1:8080)
          └── pcfutbolsala.com  →  pc_futbol Docker nginx  (127.0.0.1:7080)

Each Docker stack:
  - Internal Nginx exposed only on localhost (not on public 0.0.0.0:80)
  - DB, API, frontend — all on an isolated Docker network
  - No port 80/443 in Docker — proxy owns those
```

---

## 1. Change wine-app port from 80 → 8080

By default `docker-compose.prod.yml` binds to `HTTP_PORT=80`. In the multi-site setup, the host Nginx owns port 80, so wine-app's Nginx must move to a non-public port.

In `.env` on the VPS:
```dotenv
HTTP_PORT=8080
HTTPS_PORT=8443   # not used — host nginx handles SSL
```

Also update `infra/nginx/default.prod.conf` to remove the `listen 443 ssl` block — SSL is now terminated by the host Nginx, not the Docker Nginx. Keep only:
```nginx
server {
    listen 80;
    server_name tatirosset.cat www.tatirosset.cat;
    # ... existing proxy_pass blocks unchanged ...
}
```

Restart the stack:
```bash
docker compose -f docker-compose.prod.yml up -d --force-recreate nginx
```

---

## 2. Clone and start pc_futbol_sala

```bash
cd ~/apps
git clone git@github.com:adriamuixi/pc_futbol_sala.git
cd pc_futbol_sala
```

Create `.env`:
```dotenv
ENVIRONMENT=prod
DB_NAME=pcfutbolsala
DB_USER=pcfutbolsala
DB_PASSWORD=<strong-password>
DB_ROOT_PASSWORD=<strong-password>
JWT_SECRET=<64-char-random-string>
REACT_APP_API_URL=https://pcfutbolsala.com/api/v1
NETWORK_IP=172.21.0.0/16   # different subnet from wine-app
```

In `docker-compose.yml`, change the server-service port binding so it only listens on localhost:
```yaml
server-service:
  ports:
    - "127.0.0.1:7080:80"   # was "80:80"
```

Start:
```bash
docker compose up -d --build

# Restore DB
docker exec -i pc_futbol_sala-db-1 mysql \
  -uroot -p<DB_ROOT_PASSWORD> < backup.sql
```

---

## 3. Install host Nginx

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
sudo systemctl enable nginx
```

---

## 4. Host Nginx config

### /etc/nginx/sites-available/tatirosset.cat
```nginx
server {
    listen 80;
    server_name tatirosset.cat www.tatirosset.cat;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        default_type "text/plain";
        try_files $uri =404;
    }

    location / { return 301 https://$host$request_uri; }
}

server {
    listen 443 ssl;
    http2 on;
    server_name tatirosset.cat www.tatirosset.cat;

    ssl_certificate     /etc/letsencrypt/live/tatirosset.cat/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tatirosset.cat/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 16M;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/javascript;
    gzip_vary on;

    location / {
        proxy_pass         http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

### /etc/nginx/sites-available/pcfutbolsala.com
```nginx
server {
    listen 80;
    server_name pcfutbolsala.com www.pcfutbolsala.com;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        default_type "text/plain";
        try_files $uri =404;
    }

    location / { return 301 https://$host$request_uri; }
}

server {
    listen 443 ssl;
    http2 on;
    server_name pcfutbolsala.com www.pcfutbolsala.com;

    ssl_certificate     /etc/letsencrypt/live/pcfutbolsala.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pcfutbolsala.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 20M;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/javascript;
    gzip_vary on;

    location / {
        proxy_pass         http://127.0.0.1:7080;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

Enable both:
```bash
sudo ln -s /etc/nginx/sites-available/tatirosset.cat   /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/pcfutbolsala.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 5. SSL certificates

DNS must point to the VPS before running this.

```bash
# Temporarily serve HTTP to get the cert
sudo certbot certonly --nginx -d tatirosset.cat   -d www.tatirosset.cat
sudo certbot certonly --nginx -d pcfutbolsala.com -d www.pcfutbolsala.com

# Reload with SSL config active
sudo nginx -t && sudo systemctl reload nginx

# Verify auto-renewal
sudo systemctl status certbot.timer
```

---

## 6. Network isolation

Use different Docker subnets to avoid conflicts:

| App | Network variable | Suggested subnet |
|-----|-----------------|-----------------|
| wine-app | (default) | `172.20.0.0/16` |
| pc_futbol_sala | `NETWORK_IP` in `.env` | `172.21.0.0/16` |

---

## 7. Port map

| Port | Who listens | Traffic |
|------|-------------|---------|
| `80` | Host Nginx | HTTP → redirect to HTTPS |
| `443` | Host Nginx | HTTPS termination |
| `127.0.0.1:8080` | wine-app Docker Nginx | tatirosset.cat internal |
| `127.0.0.1:7080` | pc_futbol Docker Nginx | pcfutbolsala.com internal |
| `127.0.0.1:5432` | wine-app Postgres | internal only |
| `127.0.0.1:3306` | pc_futbol MySQL | internal only |

All Docker ports bound to `127.0.0.1` — not reachable from outside the VPS.

---

## 8. Update workflow

```bash
# wine-app
cd ~/apps/wine-app
git pull --ff-only
./scripts/deploy-prod.sh

# pc_futbol_sala
cd ~/apps/pc_futbol_sala
git pull origin master
docker compose up -d --build
```

---

## 9. Checklist

- [ ] DNS `A` records for both domains point to VPS IP
- [ ] Firewall allows 22, 80, 443 only (`ufw status`)
- [ ] wine-app `.env` has `HTTP_PORT=8080`
- [ ] wine-app Docker Nginx removed SSL blocks (host Nginx handles SSL)
- [ ] pc_futbol_sala server-service bound to `127.0.0.1:7080`
- [ ] Different Docker subnets (`NETWORK_IP=172.21.0.0/16` for pcfutbol)
- [ ] Both stacks healthy (`docker compose ps`)
- [ ] SSL certs issued for both domains
- [ ] Host Nginx test passes (`nginx -t`)
- [ ] `certbot.timer` active for auto-renewal
