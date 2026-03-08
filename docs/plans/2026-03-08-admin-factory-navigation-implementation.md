# Admin Factory Navigation Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Clean up the admin UI by removing unused media summary blocks, replacing the unused dashboard nav entry with public-site shortcuts, and making the factory editor load safely when locale fallback content is missing.

**Architecture:** Keep the existing admin/editor architecture intact and make targeted changes in the sidebar and editor components only. For the factory editor path, normalize missing locale content into a safe empty state and avoid relying on a missing `data/es/factory.json` fallback so the admin route stays usable.

**Tech Stack:** Next.js App Router, React, TypeScript, Next Link, existing admin content repository APIs

---

### Task 1: Remove unused media summary blocks

**Files:**
- Modify: `src/components/admin/ProductEditor/ProductEditor.tsx`
- Modify: `src/components/admin/FactoryEditor/FactoryEditor.tsx`

**Step 1: Inspect existing summary rendering**

Confirm both editors still render a bottom `可用媒體` block and identify any state that becomes unused after removal.

**Step 2: Remove the product editor summary UI**

Delete the bottom `可用媒體` section from `src/components/admin/ProductEditor/ProductEditor.tsx` without changing upload or gallery behavior.

**Step 3: Remove the factory editor summary UI**

Delete the bottom `可用媒體` section from `src/components/admin/FactoryEditor/FactoryEditor.tsx`.

**Step 4: Remove dead memo/state if no longer needed**

Delete any `useMemo` or local state that only existed to build the removed media summary.

**Step 5: Verify compilation mentally and with type-safe imports**

Check that imports like `useMemo` are still required; if not, remove them.

### Task 2: Replace dashboard nav with public-site shortcuts

**Files:**
- Modify: `src/components/admin/AdminShell/AdminShell.tsx`

**Step 1: Update admin nav items**

Remove the `/admin` `儀表板` nav item from the main admin nav list.

**Step 2: Add a public-site links group**

Add a separate sidebar section titled `檢視網站` with links to:

- `/`
- `/factory`
- `/products`

**Step 3: Open public links in a new tab**

Set `target="_blank"` and `rel="noreferrer"` on the public-site links only.

**Step 4: Keep current sidebar visual language**

Reuse the existing inline styles and spacing patterns instead of introducing a new design system.

### Task 3: Make factory admin content loading resilient

**Files:**
- Modify: `src/lib/admin/content-repository.ts`
- Modify: `src/components/admin/FactoryEditor/FactoryEditor.tsx`
- Review: `src/app/admin/factory/page.tsx`
- Review: `data/en/factory.json`
- Review: `data/ru/factory.json`

**Step 1: Inspect fallback behavior**

Review `getFactoryContent()` and `readLocaleJsonFile()` to confirm what happens when no D1 row exists for locale `es`.

**Step 2: Implement safe fallback for missing locale file**

Adjust the content loading path so that missing `factory.json` files do not break admin rendering. Return an empty object fallback when the locale file does not exist.

**Step 3: Preserve frontend-aligned editor shape**

Ensure `FactoryEditor` still parses content into:

- `title`
- `banner`
- `headline`
- `intro`
- `sections`

and does not require extra fields not used by the frontend factory page.

**Step 4: Re-check admin factory page wiring**

Confirm `src/app/admin/factory/page.tsx` still passes locale content into `FactoryEditor` exactly once and does not need additional route-level changes.

### Task 4: Final verification

**Files:**
- Review: `src/components/admin/ProductEditor/ProductEditor.tsx`
- Review: `src/components/admin/FactoryEditor/FactoryEditor.tsx`
- Review: `src/components/admin/AdminShell/AdminShell.tsx`
- Review: `src/lib/admin/content-repository.ts`

**Step 1: Verify removed UI blocks**

Check that neither editor renders `可用媒體` anymore.

**Step 2: Verify sidebar behavior**

Check that the admin nav no longer shows `儀表板` and now includes the `檢視網站` group.

**Step 3: Verify factory route resilience**

Check that factory admin can render even when locale content is missing from D1 and no `data/es/factory.json` file exists.

**Step 4: Summarize deployment-neutral changes**

Document that these changes are admin/frontend wiring only and do not require Cloudflare configuration updates.
