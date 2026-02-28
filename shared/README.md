# Shared Static Assets

This folder is the single source of truth for static assets reused by both frontend apps:

- `apps/web-public`
- `apps/web-private`

Currently shared and synced:

- `public/images` (and all nested folders)

Includes:

- `public/images/flags/country`
- `public/images/flags/ccaa`

## How sync works

Each app has:

- `scripts/sync-shared-assets.mjs`
- npm hooks:
  - `predev`
  - `prebuild`

So `npm run dev` and `npm run build` automatically sync these directories into each app's `public/`.

## Docker

- Dev compose mounts `./shared` into web containers at `/shared`.
- Prod compose builds web images from repo root so `shared/public` can be copied at build time.
