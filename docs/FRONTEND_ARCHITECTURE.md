# Frontend Architecture

This document captures the architecture refactor process that was executed in this repository for:

- `apps/web-public`
- `apps/web-private`

It reflects the real changes performed in code (not a proposal).

## Scope

- Move from oversized `App.tsx` composition toward modular-by-feature structure.
- Keep single-page behavior for now (no forced route architecture).
- Prepare both apps to scale into route-based modules later.
- Centralize UI copy in YAML locales (`ca`, `es`, `en`) and remove hardcoded strings.

## Target Principles

- `App.tsx` is a minimal root composition file.
- `pages/` contains screen-level composition (`HomePage` currently).
- `features/` groups domain-specific code.
- `shared/` contains cross-feature helpers.
- `app/` stores global config/bootstrap constants.
- No unnecessary libraries and no empty enterprise layering.

---

## Web Public (`apps/web-public`)

### Executed Refactor

1. **Locale architecture by page/area**
- Reorganized locales to level-based folders:
  - `i18n/locales/common/{ca,es,en}.yaml`
  - `i18n/locales/about/{ca,es,en}.yaml`
  - `i18n/locales/doMap/{ca,es,en}.yaml`
  - `i18n/locales/toolbar/{ca,es,en}.yaml`
  - `i18n/locales/main/{ca,es,en}.yaml`
- Updated `messages.ts` loader to merge `./locales/*/*.yaml`.

2. **Hardcoded copy migration**
- Replaced hardcoded UI labels with translation keys.
- Added semantic keys for repeated UI text (`doLabel`, `removeAction`, `notAvailableShort`, aria labels, etc.).
- Fixed non-English content found in `about/en.yaml`.

3. **App decomposition**
- `App.tsx` reduced to shell.
- Main implementation moved to `pages/HomePage/HomePage.tsx`.
- Extracted page-level sections/components:
  - `features/about/components/AboutPageView.tsx`
  - `features/catalog/components/CatalogPageView.tsx`
  - `features/catalog/components/CatalogOverlays.tsx`
  - `features/do-map/components/DoMapPageView.tsx`

4. **Shared and feature extraction**
- Added `app/config/constants.ts`.
- Added `shared/lib/*` modules (`cookies`, `env`, `geo`, `locale`, `seo`, `theme`, `urlState`).
- Added feature services/types (catalog + do-map), including Leaflet map setup extraction.

### Validation

- `tsc`: pass.
- `eslint`: pass.
- `build`: blocked by FS permissions (`EACCES` in `public/images/brand` during asset sync).

---

## Web Private (`apps/web-private`)

### Executed Refactor

1. **i18n cleanup and semantic key expansion**
- Migrated remaining hardcoded UI content to YAML-backed translation calls.
- Added semantic keys across `common/dashboard/dos/wines/reviews/apiDoc` in `ca/es/en`.
- Replaced locale ternaries for success messages with interpolation keys:
  - `dos.ui.created_success`
  - `dos.ui.updated_success`
  - `dos.ui.deleted_success`
  - `wines.ui.created_success`
  - `wines.ui.updated_success`

2. **Root minimization + page composition**
- Moved full app implementation from `src/App.tsx` to:
  - `src/pages/HomePage/HomePage.tsx`
- Created page barrel:
  - `src/pages/HomePage/index.ts`
- Reduced `src/App.tsx` to:
  - render `<HomePage />` only.

3. **Modular base structure created**
- `src/app/config/constants.ts`
- `src/shared/lib/{env,locale,math,text}.ts`
- `src/features/dashboard/index.ts`
- `src/features/wines/index.ts`
- `src/features/reviews/index.ts`
- `src/features/do/index.ts`
- `src/features/apiDoc/index.ts`
- `src/features/settings/index.ts`

4. **Utility extraction from large page file**
- Moved reusable helpers from `HomePage.tsx` to shared libs:
  - API base/asset URL resolution
  - locale helper
  - math/stat functions
  - text normalization/escaping
- Moved global constants (theme/storage/default assets) to `app/config/constants.ts`.

5. **Language switcher and accessibility labels**
- Updated `LanguageSelector` to use translation key for screen-reader label.
- Replaced multiple hardcoded aria labels and fixed strings in page UI.

6. **Feature component extraction (phase continuation)**
- Extracted API documentation screen into:
  - `src/features/apiDoc/components/ApiDocPanel.tsx`
- Extracted settings screen into:
  - `src/features/settings/components/SettingsPanel.tsx`
- Updated feature barrels:
  - `src/features/apiDoc/index.ts`
  - `src/features/settings/index.ts`
- Replaced the two large inline conditional blocks in `HomePage.tsx` with feature component composition.

7. **Feature component extraction (deep split)**
- Extracted dashboard screen into:
  - `src/features/dashboard/components/DashboardPanel.tsx`
- Extracted wines list screen into:
  - `src/features/wines/components/WinesListPanel.tsx`
- Extracted reviews list screen into:
  - `src/features/reviews/components/ReviewsPanel.tsx`
- Extracted DO directory screen into:
  - `src/features/do/components/DoDirectoryPanel.tsx`
- Updated feature barrels:
  - `src/features/dashboard/index.ts`
  - `src/features/wines/index.ts`
  - `src/features/reviews/index.ts`
  - `src/features/do/index.ts`
- Replaced four additional large inline menu blocks in `HomePage.tsx` with feature-level composition.
- Result: `HomePage.tsx` reduced from ~7408 lines (pre-split baseline) to ~6263 lines.

8. **Feature component extraction (forms + profile)**
- Extracted DO create form into:
  - `src/features/do/components/DoCreatePanel.tsx`
- Extracted review create/edit form into:
  - `src/features/reviews/components/ReviewEditorPanel.tsx`
- Extracted wine create/edit form into:
  - `src/features/wines/components/WineFormPanel.tsx`
- Extracted wine profile screen into:
  - `src/features/wines/components/WineProfilePanel.tsx`
- Added feature service for DO country code normalization:
  - `src/features/do/services/countryCode.ts`
- Updated feature barrels:
  - `src/features/do/index.ts`
  - `src/features/reviews/index.ts`
  - `src/features/wines/index.ts`
- Replaced four more heavy sections in `HomePage.tsx`:
  - `doCreate`
  - `reviewCreate` / `reviewEdit`
  - `wineCreate` / `wineEdit`
  - `wineProfile`
- Result: `HomePage.tsx` reduced further from ~6263 lines to ~5443 lines.

9. **Overlay/Modal extraction (remaining heavy UI shell)**
- Extracted DO edit modal into:
  - `src/features/do/components/DoEditModal.tsx`
- Extracted mobile wine filters modal into:
  - `src/features/wines/components/WineFiltersMobileModal.tsx`
- Extracted photo editor modal into:
  - `src/features/wines/components/PhotoEditorModal.tsx`
- Extracted gallery modal into:
  - `src/features/wines/components/WineGalleryModal.tsx`
- Added shared confirmation modal:
  - `src/shared/components/ConfirmDeleteModal.tsx`
- Updated feature barrels:
  - `src/features/do/index.ts`
  - `src/features/wines/index.ts`
- Replaced inline modal/overlay blocks in `HomePage.tsx` with component composition.
- Result: `HomePage.tsx` reduced further from ~5443 lines to ~5060 lines.

10. **Photo logic extraction (hooks + services)**
- Added photo editor rendering service:
  - `src/features/wines/services/photoEditor.ts`
  - Includes ratio resolution and canvas render pipeline.
- Added photo gesture hook:
  - `src/features/wines/hooks/usePhotoEditorGestures.ts`
  - Encapsulates pointer drag/pinch interaction state and handlers.
- Rewired `HomePage.tsx` to consume the new hook/service instead of inline gesture/render logic.
- Result: `HomePage.tsx` reduced further from ~5060 lines to ~4845 lines.

### Validation

- `tsc`: pass.
- `eslint`: no errors in touched files; existing hook dependency warnings remain in `HomePage.tsx`.
- `build`: blocked by FS permissions (`EACCES` in `public/images/brand` during asset sync).

---

## Current Folder Baseline

### `apps/web-public/src`

- `app/`
- `shared/`
- `features/`
- `pages/HomePage/`
- `i18n/locales/{common,about,doMap,toolbar,main}/`
- `App.tsx` (minimal)

### `apps/web-private/src`

- `app/`
- `shared/`
- `features/`
  - `dashboard/`
  - `wines/`
  - `reviews/`
  - `do/`
  - `apiDoc/`
  - `settings/`
- `pages/HomePage/`
- `i18n/locales/{ca,es,en}/*.yaml`
- `App.tsx` (minimal)

---

## What Is Still Pending (Known Follow-up)

1. Continue splitting `HomePage.tsx` in `web-private` into feature hooks/services for remaining large action callbacks (upload/save/delete flows) and state orchestration.
2. Resolve filesystem ownership/permissions for `public/images` in both apps, then rerun full production builds.
3. Optionally normalize legacy i18n key naming style in `web-private` (some keys still have older snake-case phrases).

---

## Notes on Routing

No strict route architecture was forced.

The codebase is now prepared to evolve toward dedicated routes later (for example: catalog, wine detail, reviews, do-map) without redoing root composition.
