# Russian Full Translation + Yandex SEO Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fully translate all data-layer content into Russian with three-tier Yandex SEO keyword optimization.

**Architecture:** Restructure `data/` into per-locale subdirectories (`data/en/`, `data/ru/`). Modify `src/lib/data.ts` to accept a `locale` parameter. Update all page components to pass locale through. Create complete Russian translations of all data files with SEO keywords woven in.

**Tech Stack:** Next.js 16, next-intl, TypeScript, JSON data files

---

### Task 1: Restructure data directory — move English files to `data/en/`

**Files:**
- Create: `data/en/` directory
- Move: `data/about.json` → `data/en/about.json`
- Move: `data/factory.json` → `data/en/factory.json`
- Move: `data/equipment.json` → `data/en/equipment.json`
- Move: `data/home.json` → `data/en/home.json`
- Move: `data/contact.json` → `data/en/contact.json`
- Move: `products-data.json` → `data/en/products-data.json`
- Keep: `data/site.json` (shared, non-translatable)

**Step 1: Create directories and move files**

```bash
mkdir -p data/en data/ru
mv data/about.json data/en/about.json
mv data/factory.json data/en/factory.json
mv data/equipment.json data/en/equipment.json
mv data/home.json data/en/home.json
mv data/contact.json data/en/contact.json
mv products-data.json data/en/products-data.json
```

**Step 2: Commit**

```bash
git add -A
git commit -m "refactor: move English data files to data/en/ for i18n support"
```

---

### Task 2: Update `src/lib/data.ts` to accept locale parameter

**Files:**
- Modify: `src/lib/data.ts`

**Step 1: Rewrite data.ts**

Replace the entire file with locale-aware loading:

```typescript
import fs from "fs";
import path from "path";

function loadJson<T>(locale: string, filename: string): T {
  const filePath = path.join(process.cwd(), "data", locale, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

function loadSharedJson<T>(filename: string): T {
  const filePath = path.join(process.cwd(), "data", filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function getSiteData(locale: string) {
  const siteData = loadSharedJson<any>("site.json");
  const productsData = getProductsData(locale);
  const rawCategories: unknown[] = Array.isArray(productsData?.categories)
    ? productsData.categories
    : [];

  const categories = Array.from(
    new Set(
      rawCategories.filter(
        (category: unknown): category is string =>
          typeof category === "string" && category.trim().length > 0,
      ),
    ),
  );

  siteData.nav = [
    { label: "Factory", href: "/factory" },
    {
      label: "Products",
      href: "/products",
      children: categories.map((category) => ({
        label: category,
        href: `/products?category=${encodeURIComponent(category)}`,
      })),
    },
    { label: "Contact Us", href: "/contact" },
  ];

  return siteData;
}

export function getHomeData(locale: string) {
  return loadJson<any>(locale, "home.json");
}

export function getAboutData(locale: string) {
  return loadJson<any>(locale, "about.json");
}

export function getFactoryData(locale: string) {
  return loadJson<any>(locale, "factory.json");
}

export function getEquipmentData(locale: string) {
  return loadJson<any>(locale, "equipment.json");
}

export function getContactData(locale: string) {
  return loadJson<any>(locale, "contact.json");
}

export function getProductsData(locale: string = "en") {
  return loadJson<any>(locale, "products-data.json");
}
```

**Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit 2>&1 | head -50
```

Expected: Errors about missing `locale` argument in page components (will fix in Task 3).

**Step 3: Commit**

```bash
git add src/lib/data.ts
git commit -m "refactor: add locale parameter to all data loading functions"
```

---

### Task 3: Update all page components to pass locale to data functions

**Files:**
- Modify: `src/app/(site)/[locale]/layout.tsx:91` — `getSiteData()` → `getSiteData(locale)`
- Modify: `src/app/(site)/[locale]/page.tsx:34-35` — `getHomeData()` → `getHomeData(locale)`, `getProductsData()` → `getProductsData(locale)`
- Modify: `src/app/(site)/[locale]/about/page.tsx:39` — `getAboutData()` → `getAboutData(locale)`
- Modify: `src/app/(site)/[locale]/factory/page.tsx:51` — `getFactoryData()` → `getFactoryData(locale)`
- Modify: `src/app/(site)/[locale]/equipment/page.tsx:40` — `getEquipmentData()` → `getEquipmentData(locale)`
- Modify: `src/app/(site)/[locale]/equipment/qc/page.tsx:23,43` — `getEquipmentData()` → `getEquipmentData(locale)`
- Modify: `src/app/(site)/[locale]/equipment/machining/page.tsx` — same pattern
- Modify: `src/app/(site)/[locale]/contact/page.tsx:39` — `getContactData()` → `getContactData(locale)`
- Modify: `src/app/(site)/[locale]/products/page.tsx:39` — `getProductsData()` → `getProductsData(locale)`
- Modify: `src/app/(site)/[locale]/products/[id]/page.tsx:18,30,60` — `getProductsData()` → `getProductsData(locale)`
- Modify: `src/app/sitemap.ts` — `getProductsData()` → `getProductsData("en")` (sitemap uses English)

**Step 1: Update each file**

For each page component, find calls to data functions and add `locale` parameter. The `locale` variable is already available in every page from `const { locale } = await params;`.

For `layout.tsx`, the `getSiteData(locale)` call is at line 91.

For `products/[id]/page.tsx`, there are 3 calls to `getProductsData()`:
- `generateStaticParams()` (line 18): use `getProductsData("en")` since static params only need IDs
- `generateMetadata()` (line 30): needs locale from params
- `ProductDetailPage()` (line 60): needs locale from params

For `sitemap.ts`, use `getProductsData("en")` since sitemap data is locale-independent for product IDs.

**Step 2: Build verification**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build succeeds (all data still loads from `data/en/`).

**Step 3: Commit**

```bash
git add src/
git commit -m "refactor: pass locale to all data loading functions"
```

---

### Task 4: Fix hardcoded English strings in page components

Some pages have English strings hardcoded in JSX that need to be moved to `src/messages/{locale}.json`.

**Files:**
- Modify: `src/messages/en.json` — add new keys
- Modify: `src/messages/ru.json` — add new keys
- Modify: `src/messages/es.json` — add new keys (English placeholder for now)
- Modify: `src/app/(site)/[locale]/about/page.tsx` — use translations instead of hardcoded strings
- Modify: `src/app/(site)/[locale]/equipment/page.tsx` — same
- Modify: `src/app/(site)/[locale]/equipment/qc/page.tsx` — same
- Modify: `src/app/(site)/[locale]/equipment/machining/page.tsx` — same

**Step 1: Add keys to en.json**

Add to `en.json`:

```json
{
  "about": {
    ...existing keys...,
    "companyIntroHeading": "Company Introduction",
    "whyLiheHeading": "Why Lihe",
    "whyLiheSub": "What sets us apart in the PET mold industry",
    "valuesHeading": "Core Values",
    "valuesSub": "The principles that drive everything we do"
  },
  "equipment": {
    ...existing keys...,
    "ourEquipment": "Our Equipment",
    "ourEquipmentSub": "Explore our world-class manufacturing and quality control systems",
    "keyCapabilities": "Key Capabilities",
    "keyCapabilitiesSub": "Our quality control equipment and systems",
    "gallery": "Equipment Gallery",
    "gallerySub": "See our QC systems in action",
    "gallerySubMachining": "See our machining systems in action"
  }
}
```

**Step 2: Add corresponding Russian keys to ru.json**

```json
{
  "about": {
    ...existing keys...,
    "companyIntroHeading": "О компании",
    "whyLiheHeading": "Почему Lihe",
    "whyLiheSub": "Наши ключевые преимущества в индустрии пресс-форм для ПЭТ",
    "valuesHeading": "Основные ценности",
    "valuesSub": "Принципы, которые определяют нашу работу"
  },
  "equipment": {
    ...existing keys...,
    "ourEquipment": "Наше оборудование",
    "ourEquipmentSub": "Высокоточные производственные и контрольно-измерительные системы мирового класса",
    "keyCapabilities": "Основные возможности",
    "keyCapabilitiesSub": "Наше контрольно-измерительное оборудование",
    "gallery": "Галерея оборудования",
    "gallerySub": "Контрольно-измерительные системы в действии",
    "gallerySubMachining": "Обрабатывающее оборудование в действии"
  }
}
```

**Step 3: Add English placeholders to es.json** (same as en.json new keys)

**Step 4: Update page components**

Replace hardcoded strings with `t("keyName")` calls. For example in `about/page.tsx`:

```tsx
<SectionHeading title={t("companyIntroHeading")} />
```

```tsx
<SectionHeading title={t("whyLiheHeading")} subtitle={t("whyLiheSub")} />
```

```tsx
<SectionHeading title={t("valuesHeading")} subtitle={t("valuesSub")} />
```

Same pattern for equipment pages.

**Step 5: Build verification**

```bash
npm run build 2>&1 | tail -20
```

**Step 6: Commit**

```bash
git add src/
git commit -m "fix: replace hardcoded English strings with i18n translations"
```

---

### Task 5: Create Russian data files — `data/ru/home.json`

**Files:**
- Create: `data/ru/home.json`

**Step 1: Create file**

Copy structure from `data/en/home.json`. Translate all text content into Russian with tier-1 and tier-3 SEO keywords. Keep image paths and hrefs identical.

Key translations for this file:
- Product category names → Russian (e.g., "Blow Mold" → "Выдувная форма")
- Showcase descriptions → Russian with SEO keywords woven in
- Section headings → Russian
- Stats labels → Russian

Example showcase item:

```json
{
  "name": "Пресс-форма для ПЭТ-преформ",
  "description": "Многогнездные пресс-формы для ПЭТ-преформ до 160 гнезд. Совместимы с термопластавтоматами HUSKY, NETSTAL и SIPA.",
  "image": "/images/home/preform-mold.webp",
  "alt": "Многогнездная пресс-форма для ПЭТ-преформ",
  "href": "/products?category=preform-mold"
}
```

**Step 2: Commit**

```bash
git add data/ru/home.json
git commit -m "feat(i18n): add Russian translation for home page data"
```

---

### Task 6: Create Russian data files — `data/ru/about.json`

**Files:**
- Create: `data/ru/about.json`

**Step 1: Create file**

Translate company intro, philosophy, business description, whyLihe sections, and values. Weave in tier-1 keywords (пресс-форма для ПЭТ-преформ, выдувная форма, горячеканальная система) and tier-2 keywords (HUSKY, NETSTAL, SIPA, SIDEL, KRONES compatibility).

Keep `banner` image paths identical to English version.

**Step 2: Commit**

```bash
git add data/ru/about.json
git commit -m "feat(i18n): add Russian translation for about page data"
```

---

### Task 7: Create Russian data files — `data/ru/factory.json`

**Files:**
- Create: `data/ru/factory.json`

**Step 1: Create file**

Translate all section titles and descriptions. Include tier-2 keywords about equipment brands (Mazak, Makino, Zeiss) and tier-3 application keywords. Keep image paths identical.

**Step 2: Commit**

```bash
git add data/ru/factory.json
git commit -m "feat(i18n): add Russian translation for factory page data"
```

---

### Task 8: Create Russian data files — `data/ru/equipment.json`

**Files:**
- Create: `data/ru/equipment.json`

**Step 1: Create file**

Translate category names, descriptions, and highlight lists. Use Russian technical terms:
- "Quality Control Equipment" → "Контрольно-измерительное оборудование"
- "Machining Equipment" → "Обрабатывающее оборудование"
- Highlight items translated with proper Russian technical vocabulary

Translate image alt text into Russian for Yandex image search optimization:
- "zeiss-cmm - Zeiss coordinate measuring machine" → "Координатно-измерительная машина Zeiss"

**Step 2: Commit**

```bash
git add data/ru/equipment.json
git commit -m "feat(i18n): add Russian translation for equipment page data"
```

---

### Task 9: Create Russian data files — `data/ru/contact.json`

**Files:**
- Create: `data/ru/contact.json`

**Step 1: Create file**

Translate intro text and form field descriptions. Keep phone, email, and address in original form. Weave in tier-1 keywords in the intro paragraph.

**Step 2: Commit**

```bash
git add data/ru/contact.json
git commit -m "feat(i18n): add Russian translation for contact page data"
```

---

### Task 10: Create Russian data files — `data/ru/products-data.json`

**Files:**
- Create: `data/ru/products-data.json`

**Step 1: Create file**

This is the largest translation task. Translate:
- `categories` array: all 9 category names into Russian
- Each product's `name`, `category`, and `description`
- Each image's `alt` text into Russian

Category name mapping:
- "Blow mold" → "Выдувная форма"
- "Compression mold" → "Компрессионная форма"
- "Closure mold" → "Форма для колпачков"
- "Preform mold" → "Пресс-форма для преформ"
- "Hotrunner system" → "Горячеканальная система"
- "Accessories" → "Комплектующие"
- "High precision mold base manufacturing" → "Высокоточное производство модельных плит"
- "QC equipment" → "Контрольно-измерительное оборудование"
- "Machining equipment" → "Обрабатывающее оборудование"

Product descriptions: translate each unique description, weaving in tier-2 (equipment compatibility) and tier-3 (application scenario) keywords naturally.

Image alt text: translate all alt text into Russian for Yandex image search.

Keep all `id`, `detail_url`, image `src` paths, and `thumbnail` paths identical.

**Step 2: Commit**

```bash
git add data/ru/products-data.json
git commit -m "feat(i18n): add Russian translation for products data"
```

---

### Task 11: Refine `src/messages/ru.json` — terminology audit + SEO keywords

**Files:**
- Modify: `src/messages/ru.json`

**Step 1: Review and update existing translations**

Audit all existing translations against the industry terminology reference in `reseach_ru0305.md`. Key refinements:

- Ensure nav labels for product categories match the Russian category names used in `data/ru/products-data.json`
- Verify meta descriptions contain tier-1 SEO keywords
- Check all UI strings for natural, professional Russian

**Step 2: Commit**

```bash
git add src/messages/ru.json
git commit -m "refine(i18n): audit and improve Russian UI translations for SEO"
```

---

### Task 12: Add Russian keywords to layout metadata

**Files:**
- Modify: `src/app/(site)/[locale]/layout.tsx`

**Step 1: Add locale-specific keywords**

Update `generateMetadata` to include Russian keywords when `locale === "ru"`:

```typescript
const keywordsMap: Record<string, string[]> = {
  en: [
    "PET preform mold", "blow mold", "hot runner system",
    "multi-cavity mold", "preform tooling", "injection molding machine",
    "compression mold", "closure mold", "beverage packaging solutions",
    "PET mold manufacturer",
  ],
  ru: [
    "пресс-форма для ПЭТ-преформ", "выдувная форма",
    "горячеканальная система", "многогнездная пресс-форма",
    "оснастка для преформ", "термопластавтомат",
    "компрессионная форма", "форма для колпачков",
    "упаковка для напитков", "производитель пресс-форм для ПЭТ",
    "пресс-формы для HUSKY", "формы для NETSTAL",
    "формы для ПЭТ-бутылок для воды",
    "пресс-формы для пищевой упаковки",
  ],
  es: [
    "PET preform mold", "blow mold", "hot runner system",
    "multi-cavity mold", "preform tooling", "injection molding machine",
    "compression mold", "closure mold", "beverage packaging solutions",
    "PET mold manufacturer",
  ],
};
```

Use `keywordsMap[locale] ?? keywordsMap.en` in the metadata return.

**Step 2: Build verification**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build succeeds with all locale pages generated.

**Step 3: Commit**

```bash
git add src/app/\(site\)/\[locale\]/layout.tsx
git commit -m "feat(seo): add Russian keywords to layout metadata"
```

---

### Task 13: Final build verification and smoke test

**Step 1: Full build**

```bash
npm run build
```

Expected: Build succeeds, all pages generated for en/ru/es.

**Step 2: Check generated output**

```bash
ls out/ru/
ls out/ru/products/
ls out/en/
```

Verify Russian pages exist alongside English pages.

**Step 3: Spot-check Russian content**

```bash
grep -l "пресс-форма" out/ru/*.html | head -5
grep -l "ПЭТ-преформ" out/ru/*.html | head -5
```

Verify Russian keywords appear in generated HTML.

**Step 4: Final commit (if any remaining changes)**

```bash
git status
```
