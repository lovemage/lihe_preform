---
description: Admin factory/navigation cleanup and frontend-view shortcuts
---

# Admin Factory / Navigation Design

## Goals

- Remove the unused `可用媒體` blocks from admin product detail and factory editor pages.
- Remove the `儀表板` entry from the admin sidebar because it is not used in the current workflow.
- Add `檢視網站` links to the admin navigation so editors can quickly open the public site.
- Fix the factory admin editor so its displayed content matches the frontend factory page data shape and does not break when a locale file is missing.

## Scope

### In scope

- `src/components/admin/ProductEditor/ProductEditor.tsx`
- `src/components/admin/FactoryEditor/FactoryEditor.tsx`
- `src/components/admin/AdminShell/AdminShell.tsx`
- `src/app/admin/factory/page.tsx`
- Related locale/content loading code if needed for factory fallback handling

### Out of scope

- Redesigning the whole admin UI
- Adding per-product frontend preview links inside each editor page
- Changing frontend factory page layout

## Problems Identified

### 1. Unused media summary blocks

Both product detail and factory editor still expose a bottom `可用媒體` summary block that does not help the editor workflow.

### 2. Sidebar information architecture

The admin sidebar still includes `儀表板`, but the active content workflow is centered on direct content sections. Editors also need fast access to the live site from the same sidebar.

### 3. Factory editor content mismatch risk

The factory editor assumes `en`, `ru`, and `es` are always available, but the static content source only has `en` and `ru` factory files. If D1 has no row for `es`, fallback file loading can fail or produce an empty admin state. The editor should handle missing locale content safely and still preserve the page structure.

## Proposed Approach

### Navigation

- Remove the `儀表板` nav item.
- Keep core admin content links.
- Add a separate `檢視網站` group in the sidebar with public links:
  - `/`
  - `/factory`
  - `/products`
- Open these links in a new tab.

### Product / Factory editor cleanup

- Remove the bottom media summary section from both editors.
- Keep upload actions and current image selection behavior unchanged.

### Factory content handling

- Keep current `FactoryState` shape aligned to frontend `factory.json`:
  - `title`
  - `banner`
  - `headline`
  - `intro`
  - `sections`
- Make missing locale content safe by normalizing undefined/missing source data into an empty but valid `FactoryState` instead of relying on a missing static file.
- Preserve current section/image/item editing model.

## Expected Outcome

- Cleaner admin edit pages.
- More useful sidebar navigation for content operations.
- Factory admin page consistently shows editable content without blank/missing state caused by absent locale fallback files.

## Verification

- Product detail editor no longer shows `可用媒體`.
- Factory editor no longer shows `可用媒體`.
- Sidebar no longer shows `儀表板`.
- Sidebar shows `檢視網站` links.
- Factory admin page loads without missing-content errors and shows the expected editable structure for active locales.
