# Frontend Locale Guide

This guide defines the localization structure for `apps/web-private` and `apps/web-public`.

## Goal

- Keep all user-facing copy in YAML files.
- Avoid hardcoded UI strings in `App.tsx` and components.
- Use a predictable file layout by language and UI domain/tab.

## Locale Folder Structure

```text
apps/web-private/src/i18n/locales/
  ca/
    common.yaml
    login.yaml
    menu.yaml
    dashboard.yaml
    wines.yaml
    dos.yaml
    reviews.yaml
    admin.yaml
    topbar.yaml
    apiDoc.yaml
    wineProfile.yaml
    ui.yaml

apps/web-public/src/i18n/locales/
  ca/
    common.yaml
    about.yaml
    filters.yaml
    topbar.yaml
    doMap.yaml
    card.yaml
    modal.yaml
    sort.yaml
    wineType.yaml
    icons.yaml
  es/
    ... same structure ...
  en/
    ... same structure ...
  es/
    common.yaml
    login.yaml
    menu.yaml
    dashboard.yaml
    wines.yaml
    dos.yaml
    reviews.yaml
    admin.yaml
    topbar.yaml
    apiDoc.yaml
    wineProfile.yaml
    ui.yaml
  en/
    common.yaml
    login.yaml
    menu.yaml
    dashboard.yaml
    wines.yaml
    dos.yaml
    reviews.yaml
    admin.yaml
    topbar.yaml
    apiDoc.yaml
    wineProfile.yaml
    ui.yaml
```

## File Responsibilities

- `common.yaml`: shared copy used in multiple places
- Page/section files: one file per page/area (`dos.yaml`, `reviews.yaml`, `about.yaml`, `doMap.yaml`, etc.)
- `ui.yaml`: cross-section UI copy that still belongs to frontend screens

## Loading Strategy

`apps/web-private/src/i18n/messages.ts` auto-loads and merges all YAML files in `./locales/*/*.yaml`.

Rules:

- Same key paths must exist across `ca`, `es`, and `en`.
- Avoid duplicate keys across files unless intentionally overriding.
- Keep key names stable; change values, not key paths.
- All keys must be English semantic keys (never Spanish/Catalan key names).

## App Rules (No Hardcoded Copy)

- Do not write user-visible strings directly in JSX.
- Use `t('...')` or `labels...` from i18n.
- For enum-like labels (country names, aging type, photo type), use locale keys under `common`.

Examples:

- `common.countries.spain`
- `common.agingType.crianza`
- `common.photoType.front_label`
- `topbar.wineCreate`

## Language Support

Current UI locales:

- `es` (Spanish)
- `ca` (Catalan)
- `en` (English)

`LanguageSelector` must expose all locales from `localeLabels`, not hardcoded options.
