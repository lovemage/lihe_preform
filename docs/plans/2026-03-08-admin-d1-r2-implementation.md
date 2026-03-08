# Admin D1 R2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an authenticated admin panel that manages multilingual home and product content in Cloudflare D1, uploads WebP images to Cloudflare R2, and publishes generated JSON files for the existing frontend.

**Architecture:** Add a protected `/admin` area inside the existing Next.js app, introduce a server-side content layer for auth, D1, R2, and JSON publishing, and keep the current frontend readers stable by generating `data/<locale>/*.json` from D1. The first implementation should enable `en` and `ru` publishing while keeping `es` reserved in the schema and admin language tabs.

**Tech Stack:** Next.js App Router, TypeScript, next-intl, Cloudflare D1, Cloudflare R2 (S3-compatible API), Sharp, Zod, jose, AWS SDK v3.

---

### Task 1: Prepare runtime and dependencies

**Files:**
- Modify: `package.json`
- Modify: `next.config.ts`
- Modify: `wrangler.json`
- Modify: `README.md`

**Step 1: Add the failing setup expectation**

Document the required runtime capabilities:

```text
The app must support server routes, D1 access, R2 uploads, and JSON publish writes.
```

**Step 2: Update dependencies**

Add minimal dependencies for the feature set:

```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "latest-compatible",
    "jose": "latest-compatible",
    "sharp": "latest-compatible",
    "zod": "latest-compatible"
  }
}
```

**Step 3: Switch away from static export**

Update `next.config.ts` to remove `output: "export"` and allow remote R2 image hosts if needed.

**Step 4: Extend Wrangler config**

Add D1 and R2 binding placeholders plus local dev notes.

**Step 5: Verify project config**

Run install and typecheck after code changes are complete.

### Task 2: Add shared admin/server infrastructure

**Files:**
- Create: `src/lib/admin/config.ts`
- Create: `src/lib/admin/auth.ts`
- Create: `src/lib/admin/session.ts`
- Create: `src/lib/admin/guards.ts`
- Create: `src/lib/admin/locales.ts`
- Create: `src/lib/utils/env.ts`
- Modify: `src/middleware.ts`

**Step 1: Write the failing auth/session tests mentally as behavior targets**

Behavior targets:

```ts
// valid login issues session cookie
// invalid login is rejected
// admin routes redirect to /admin/login when unauthenticated
```

**Step 2: Implement env and auth helpers**

Create helpers to read env, verify admin username/password, and sign/verify session tokens.

**Step 3: Protect admin routes**

Keep locale middleware for site routes, but bypass locale handling for `/admin` and `/api/admin`.

**Step 4: Add shared locale config**

Expose admin locales `en`, `ru`, `es` and publish locales `en`, `ru`.

**Step 5: Verify imports compile**

Run typecheck after wiring auth helpers into routes.

### Task 3: Add D1/R2/content schemas and services

**Files:**
- Create: `src/lib/admin/schema.ts`
- Create: `src/lib/admin/d1.ts`
- Create: `src/lib/admin/media.ts`
- Create: `src/lib/admin/content-repository.ts`
- Create: `src/lib/admin/publish.ts`
- Create: `src/types/admin.ts`

**Step 1: Define D1 schema contract in code**

Represent tables and row types for:

```ts
admin_users
admin_sessions
media_assets
media_asset_translations
categories
category_translations
products
product_translations
product_images
home_sections
home_section_translations
home_section_media
```

**Step 2: Implement D1 access helpers**

Create a server-only DB adapter that can read from bound D1 in production and env-driven fallback config during Node runtime.

**Step 3: Implement media upload service**

Convert uploaded files to WebP using Sharp, upload to R2, and persist media records.

**Step 4: Implement content repository**

Add read/write functions for products and home content with translation-aware payloads.

**Step 5: Implement publish service**

Generate `data/en/home.json`, `data/ru/home.json`, `data/en/products-data.json`, and `data/ru/products-data.json` from D1 content.

### Task 4: Build admin auth routes and shell

**Files:**
- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/api/admin/auth/login/route.ts`
- Create: `src/app/api/admin/auth/logout/route.ts`
- Create: `src/app/api/admin/auth/me/route.ts`
- Create: `src/components/admin/AdminShell/AdminShell.tsx`
- Create: `src/components/admin/AdminLoginForm/AdminLoginForm.tsx`

**Step 1: Add login UI**

Create a minimal login page with username/password form.

**Step 2: Add auth API routes**

Implement login, logout, and current-session endpoints.

**Step 3: Add protected admin layout**

Require session for all admin pages except login.

**Step 4: Add dashboard shell**

Provide nav links for Dashboard, Home, Products, Media, Publish.

**Step 5: Verify login flow manually later**

Test invalid and valid credentials after implementation.

### Task 5: Build media management and upload API

**Files:**
- Create: `src/app/admin/media/page.tsx`
- Create: `src/app/api/admin/media/route.ts`
- Create: `src/app/api/admin/media/upload/route.ts`
- Create: `src/components/admin/MediaLibrary/MediaLibrary.tsx`
- Create: `src/components/admin/MediaUploadForm/MediaUploadForm.tsx`

**Step 1: Add upload payload validation**

Validate type and size before conversion.

**Step 2: Implement upload route**

Accept multipart file upload, convert to WebP, send to R2, persist `media_assets`, and return normalized JSON.

**Step 3: Implement media listing/update route**

Return media list and allow alt text updates per locale.

**Step 4: Add admin media page**

Allow uploads and review of uploaded assets.

**Step 5: Verify with a sample image**

Run a manual upload test after dependencies are installed.

### Task 6: Build products CRUD and translation editor

**Files:**
- Create: `src/app/admin/products/page.tsx`
- Create: `src/app/admin/products/[id]/page.tsx`
- Create: `src/app/api/admin/products/route.ts`
- Create: `src/app/api/admin/products/[id]/route.ts`
- Create: `src/components/admin/ProductTable/ProductTable.tsx`
- Create: `src/components/admin/ProductEditor/ProductEditor.tsx`
- Modify: `src/lib/admin/content-repository.ts`

**Step 1: Define product editor payloads**

Include base fields plus translation tabs:

```ts
{
  slug,
  categoryId,
  status,
  sortOrder,
  thumbnailMediaId,
  translations: {
    en: { name, description, seoTitle, seoDescription },
    ru: { ... },
    es: { ... }
  },
  gallery: [{ mediaId, sortOrder, isPrimary }]
}
```

**Step 2: Implement products API**

Support list, create, read, update, delete.

**Step 3: Build list page**

Add search/filter table for products.

**Step 4: Build editor page**

Use language tabs `EN`, `RU`, `ES`.

**Step 5: Verify JSON publish compatibility**

Ensure editor fields map cleanly to `products-data.json` structure.

### Task 7: Build home content editor

**Files:**
- Create: `src/app/admin/home/page.tsx`
- Create: `src/app/api/admin/home/route.ts`
- Create: `src/components/admin/HomeEditor/HomeEditor.tsx`
- Modify: `src/lib/admin/content-repository.ts`

**Step 1: Define editable home payload**

Match current `home.json` shape while using translation-aware fields.

**Step 2: Implement home API**

Read and update home sections in D1.

**Step 3: Build admin UI**

Expose hero, stats, highlights, showcase, featured products.

**Step 4: Add language tabs**

Support `EN`, `RU`, `ES` editing, but publish only enabled locales.

**Step 5: Verify output compatibility**

Ensure generated `home.json` still satisfies current frontend expectations.

### Task 8: Add publish endpoint and migration utilities

**Files:**
- Create: `src/app/api/admin/publish/route.ts`
- Create: `scripts/migrate-json-to-d1.mjs`
- Create: `scripts/migrate-public-images-to-r2.mjs`
- Create: `scripts/seed-admin.mjs`
- Modify: `package.json`

**Step 1: Implement publish endpoint**

Call publish service and return generated file summary.

**Step 2: Add JSON import script**

Import existing `data/en`, `data/ru` content into D1.

**Step 3: Add image migration script**

Scan `public/images`, convert/upload, and build legacy path mappings.

**Step 4: Add admin seed script**

Create the initial single admin account from env.

**Step 5: Add npm scripts**

Expose migration/seed/publish commands in `package.json`.

### Task 9: Update frontend compatibility and docs

**Files:**
- Modify: `README.md`
- Modify: `src/lib/data.ts` (only if minimal fallback changes are needed)
- Modify: `wrangler.json`

**Step 1: Keep frontend JSON readers stable**

Do not rewrite current frontend consumption unless required.

**Step 2: Document every required env var**

Include admin auth, D1, R2, publish, and runtime configuration.

**Step 3: Document setup order**

Explain install, seed, migrate, and publish flow.

**Step 4: Document Cloudflare resources**

Explain required D1 database, R2 bucket, and bindings.

**Step 5: Verify README accuracy**

Make sure each env name appears in code.

### Task 10: Verify the implementation

**Files:**
- Review only

**Step 1: Run typecheck / lint-equivalent verification**

Run:

```bash
npm run build
```

Expected: build succeeds with admin routes enabled.

**Step 2: Smoke test admin paths**

Verify:

```text
/admin/login
/admin
/admin/products
/admin/home
/admin/media
```

**Step 3: Smoke test publish flow**

Expected:

```text
data/en/home.json updated
data/ru/home.json updated
data/en/products-data.json updated
data/ru/products-data.json updated
```

**Step 4: Smoke test image upload path**

Expected:

```text
image stored in R2 as .webp and returned in media list
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add admin content management with d1 and r2"
```
