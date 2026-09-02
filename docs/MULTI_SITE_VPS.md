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

## Order of operations (read this first)

The steps below are numbered in the order they must actually run, for two reasons:

1. **Cert chicken-and-egg.** A host Nginx `listen 443 ssl` block that references
   `/etc/letsencrypt/live/<domain>/...` will fail `nginx -t` if those cert files
   don't exist yet. So the HTTP (port 80) vhost must be live *before* you run
   certbot, and the HTTPS (port 443) vhost must only be added *after* certbot has
   issued the cert.
2. **Minimize the outage.** Right now wine-app's Docker Nginx holds host ports
   80/443 directly. Nothing else can bind those ports until wine-app is cut over
   to `127.0.0.1:8080` — but host Nginx also can't start serving 80/443 until
   wine-app releases them. So: prepare everything you can *before* the cutover,
   do the cutover, then immediately flip host Nginx on to close the gap as fast
   as possible.

Expect a short outage (roughly the time it takes to run steps 3-4 below) between
wine-app releasing port 80/443 and host Nginx picking it back up. HTTPS stays
down a little longer than HTTP, until the cert is issued and the 443 block is
added (step 6).

pc_futbol_sala (step 7) is independent of this timing — do it whenever, before
or after the wine-app cutover, since it doesn't touch ports 80/443 until its own
host Nginx vhost (step 5) is enabled.

---

## 1. Install host Nginx (config only — do not start it serving 80/443 yet)

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
sudo systemctl enable nginx
```

`apt install` may try to auto-start Nginx; that's fine even if it fails to bind
80/443 (still held by wine-app's container at this point) — it'll bind
successfully once we reload it in step 4.

Remove the default site so it doesn't conflict with our vhosts:
```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

---

## 2. Host Nginx config — HTTP (port 80) only, for both domains

Only the ACME challenge + redirect block for now. The `listen 443 ssl` block is
added later, in step 6, once certs exist.

`root /opt/certbot-www;` below reuses the ACME webroot that already exists on
the VPS (wine-app's container currently bind-mounts it at
`/var/www/certbot` — see `docker-compose.prod.yml`). Host Nginx runs directly
on the VPS, not in that container, so it must reference the real host path,
`/opt/certbot-www`, not the container-internal one.

Create the vhost files:
```bash
sudo tee /etc/nginx/sites-available/tatirosset.cat > /dev/null <<'EOF'
server {
    listen 80;
    server_name tatirosset.cat www.tatirosset.cat;

    location ^~ /.well-known/acme-challenge/ {
        root /opt/certbot-www;
        default_type "text/plain";
        try_files $uri =404;
    }

    location / { return 301 https://$host$request_uri; }
}
EOF

sudo tee /etc/nginx/sites-available/pcfutbolsala.com > /dev/null <<'EOF'
server {
    listen 80;
    server_name pcfutbolsala.com www.pcfutbolsala.com;

    location ^~ /.well-known/acme-challenge/ {
        root /opt/certbot-www;
        default_type "text/plain";
        try_files $uri =404;
    }

    location / { return 301 https://$host$request_uri; }
}
EOF
```

Enable both and verify the config parses (don't reload yet — port 80 is still
held by wine-app's container):
```bash
sudo ln -s /etc/nginx/sites-available/tatirosset.cat   /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/pcfutbolsala.com /etc/nginx/sites-enabled/
sudo nginx -t
```

`nginx -t` should print `syntax is ok` / `test is successful`. If it instead
complains about port 80 being in use, that's expected at this point — it's
only testing the config syntax, not trying to bind the port (that only happens
on `start`/`reload`, which is step 4, after wine-app releases port 80).

---

## 3. Cut over wine-app to port 8080 (outage begins here)

In `.env` on the VPS, set (or add — the repo's `docker-compose.prod.yml` now
defaults to `8080`, but set it explicitly so it can't silently fall back to the
old `80` from a stale `.env`):
```dotenv
HTTP_PORT=8080
```

Remove any `HTTPS_PORT` line — it's no longer used by `docker-compose.prod.yml`.

Pull and restart:
```bash
cd ~/apps/wine-app
git pull --ff-only
docker compose -f docker-compose.prod.yml up -d --force-recreate nginx
```

At this point wine-app's Nginx is on `127.0.0.1:8080` only. Host ports 80/443
are free but nothing is listening on them yet — tatirosset.cat is down.

---

## 4. Bring host Nginx up on port 80 (closes most of the outage)

```bash
sudo systemctl reload nginx || sudo systemctl start nginx
sudo nginx -t && sudo systemctl reload nginx
```

tatirosset.cat is now reachable again over **HTTP** (redirecting to HTTPS, which
isn't live yet — see step 6). This redirect will fail for a few more minutes
until the cert exists; that's expected.

---

## 5. Issue SSL certificates

DNS must already point to the VPS. This uses the HTTP vhost from step 2/4 to
answer the ACME challenge — it does not need the 443 block yet.

```bash
sudo certbot certonly --nginx -d tatirosset.cat   -d www.tatirosset.cat
sudo certbot certonly --nginx -d pcfutbolsala.com -d www.pcfutbolsala.com

sudo systemctl status certbot.timer   # verify auto-renewal
```

---

## 6. Add the HTTPS (443) block now that certs exist (outage ends here)

Append to `/etc/nginx/sites-available/tatirosset.cat`:
```nginx
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

Append to `/etc/nginx/sites-available/pcfutbolsala.com` (only relevant once
pc_futbol_sala is deployed — step 7):
```nginx
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

```bash
sudo nginx -t && sudo systemctl reload nginx
```

tatirosset.cat is now fully back on HTTPS via host Nginx. Outage is over.

---

## 7. Clone and start pc_futbol_sala (independent of the wine-app timing above)

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

Then run steps 5 (its `certbot certonly` line) and 6 (its 443 block) above for
`pcfutbolsala.com` if you haven't already.

---

## 8. Network isolation

Use different Docker subnets to avoid conflicts:

| App | Network variable | Suggested subnet |
|-----|-----------------|-----------------|
| wine-app | (default) | `172.20.0.0/16` |
| pc_futbol_sala | `NETWORK_IP` in `.env` | `172.21.0.0/16` |

---

## 9. Port map

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

## 10. Update workflow (for routine deploys *after* the cutover above is done)

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

> `scripts/deploy-prod.sh`'s healthcheck currently curls `https://<host>:443`
> resolved straight at the container, which assumed wine-app terminated TLS
> itself. After this migration the container only answers on
> `127.0.0.1:8080` over plain HTTP — that healthcheck needs updating (point it
> at `http://127.0.0.1:8080` or run it against the public HTTPS URL through
> host Nginx instead) before you rely on this script again.

---

## 11. Checklist

- [ ] DNS `A` records for both domains point to VPS IP
- [ ] Firewall allows 22, 80, 443 only (`ufw status`)
- [ ] wine-app `.env` has `HTTP_PORT=8080` (and no stale `HTTP_PORT=80` / `HTTPS_PORT` left over)
- [ ] wine-app Docker Nginx removed SSL blocks (host Nginx handles SSL)
- [ ] pc_futbol_sala server-service bound to `127.0.0.1:7080`
- [ ] Different Docker subnets (`NETWORK_IP=172.21.0.0/16` for pcfutbol)
- [ ] Both stacks healthy (`docker compose ps`)
- [ ] SSL certs issued for both domains
- [ ] Host Nginx test passes (`nginx -t`)
- [ ] `certbot.timer` active for auto-renewal
- [ ] `scripts/deploy-prod.sh` healthcheck updated to hit `127.0.0.1:8080`, not the container's port 443
