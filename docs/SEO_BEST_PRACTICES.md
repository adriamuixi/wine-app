# SEO Best Practices (Public + Private Web)

This document is the SEO checklist for contributors and AI agents working in this repository.

## Scope

- Public website: `apps/web-public`
- Private backoffice: `apps/web-private` (must stay non-indexable)
- Edge routing: `infra/nginx/default.conf`, `infra/nginx/default.prod.conf`

## What Is Already Implemented

- Public metadata in `apps/web-public/index.html`:
  - `description`, `robots`, OpenGraph and Twitter tags
  - canonical link
  - JSON-LD (`Organization` + `WebSite`)
- Dynamic metadata updates in `apps/web-public/src/App.tsx`:
  - localized title/description for `/` and `/do-map`
  - canonical and social URL/title/description updates
- Crawl files in `apps/web-public/public`:
  - `robots.txt`
  - `sitemap.xml`
- Public web manifest corrected (`apps/web-public/public/site.webmanifest`).
- Private noindex protection:
  - meta noindex in `apps/web-private/index.html`
  - `X-Robots-Tag` for `/admin/` in nginx edge configs
- Performance SEO at nginx:
  - gzip compression enabled for text assets
  - long immutable cache for hashed frontend assets (`/assets/`)
  - long immutable cache for hashed wine photos (`/images/wines/`)
  - shorter cache for mutable shared images (`/images/`)
  - `index.html` as no-cache to avoid stale deployments

## Mandatory Rules For AI Changes

- Do not remove `noindex` protections from `/admin`.
- Keep `robots.txt` and `sitemap.xml` in sync with real public URLs.
- If adding a new public route, update:
  - page title and description logic
  - canonical URL logic
  - sitemap entries
- If changing domain, update absolute URLs in:
  - `index.html` OpenGraph/Twitter tags
  - JSON-LD
  - `robots.txt` sitemap line
  - `sitemap.xml`
- Keep metadata language-consistent (`ca` and `es` text should both be supported).

## Public SEO Checklist (Technical)

- Indexability:
  - `GET /` returns 200 and indexable metadata
  - `GET /admin/` returns `X-Robots-Tag: noindex`
- Crawl control:
  - `GET /robots.txt` is reachable
  - `GET /sitemap.xml` is reachable and valid XML
- Canonical:
  - `/` canonical points to `/`
  - `/do-map` canonical points to `/do-map`
- Social preview:
  - `og:title`, `og:description`, `og:image`, `og:url`
  - `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- Structured data:
  - JSON-LD parses without errors in Rich Results tools

## Content/On-Page Checklist

- One clear `<title>` per page context.
- One meaningful meta description per page context.
- Semantic headings in page layout (`h1` then logical structure).
- Descriptive alt text for non-decorative images.
- Internal links discoverable in HTML (avoid only JS-triggered navigation for key pages).

## Performance Checklist (SEO-Critical)

- Avoid oversized images and serve optimized formats when possible.
- Keep JS/CSS bundle growth controlled.
- Prefer lazy-loading non-critical images.
- Monitor Core Web Vitals regularly (LCP, INP, CLS).
- Ensure compression is enabled (`Content-Encoding: gzip`) for HTML/CSS/JS/JSON.
- Ensure cache headers are route-specific:
  - `index.html`: no-cache
  - hashed bundles (`/assets/*`): immutable, 1 year
  - mutable shared images: short TTL (for safe updates)

## Recommended Manual Verification After Deploy

```bash
curl -sS -I https://tatirosset.cat/ | sed -n '1,20p'
curl -sS -I https://tatirosset.cat/admin/ | sed -n '1,30p'
curl -sS https://tatirosset.cat/robots.txt
curl -sS https://tatirosset.cat/sitemap.xml | sed -n '1,40p'
curl -sS -I https://tatirosset.cat/assets/main.js | sed -n '1,25p'
curl -sS -I https://tatirosset.cat/images/wines/1/example.jpg | sed -n '1,25p'
```

Expected:

- `/admin/` includes `X-Robots-Tag: noindex, nofollow, noarchive`
- `robots.txt` contains `Disallow: /admin/`
- sitemap contains all public, indexable routes only
- `/assets/*` responds with long immutable cache
- `/`/`index.html` is not cached aggressively
