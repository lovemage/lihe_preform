# Lihe Preform Website Rebuild — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-ready Next.js 15 static website for Foshan Lihe Precision Machinery, deployed to Cloudflare Pages with i18n support (en/ru/es).

**Architecture:** Next.js 15 App Router with static export. All content sourced from local JSON data files. CSS Modules for styling. next-intl for i18n with locale prefix routing. Images already prepared as webp in public/images/.

**Tech Stack:** Next.js 15, TypeScript, CSS Modules, next-intl, Cloudflare Pages

---

## Phase 1: Project Scaffold & Configuration

### Task 1: Initialize Next.js project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `.gitignore`
- Create: `src/app/layout.tsx`

**Step 1: Initialize Next.js with TypeScript**

Run:
```bash
cd /home/aistorm/projects/lihe-preform
npx create-next-app@latest . --typescript --app --src-dir --no-tailwind --no-eslint --import-alias "@/*" --yes
```

If the directory is not empty, move existing `data/`, `public/`, `docs/`, `products-data.json` aside, init, then move back.

**Step 2: Verify the project runs**

Run: `npm run dev` — visit http://localhost:3000, expect Next.js default page.

**Step 3: Commit**

```bash
git init
git remote add origin https://github.com/lovemage/lihe_preform.git
git add -A
git commit -m "chore: initialize Next.js 15 project with TypeScript"
```

---

### Task 2: Configure next.config.ts for static export

**Files:**
- Modify: `next.config.ts`

**Step 1: Update next.config.ts**

```typescript
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default withNextIntl(nextConfig);
```

**Step 2: Install next-intl**

Run: `npm install next-intl`

**Step 3: Commit**

```bash
git add next.config.ts package.json package-lock.json
git commit -m "chore: configure static export and next-intl"
```

---

### Task 3: Set up i18n with next-intl

**Files:**
- Create: `src/i18n/request.ts`
- Create: `src/i18n/routing.ts`
- Create: `src/i18n/navigation.ts`
- Create: `src/messages/en.json`
- Create: `src/messages/ru.json`
- Create: `src/messages/es.json`
- Create: `src/middleware.ts`

**Step 1: Create i18n routing config**

`src/i18n/routing.ts`:
```typescript
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ru", "es"],
  defaultLocale: "en",
});
```

**Step 2: Create i18n request config**

`src/i18n/request.ts`:
```typescript
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

**Step 3: Create navigation helpers**

`src/i18n/navigation.ts`:
```typescript
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

**Step 4: Create middleware**

`src/middleware.ts`:
```typescript
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|images|favicon.ico|robots.txt|sitemap.xml).*)"],
};
```

Note: For static export, middleware won't run at runtime. We use `generateStaticParams` to pre-render all locale routes. The middleware is used during dev only.

**Step 5: Create English messages file**

`src/messages/en.json`:
```json
{
  "nav": {
    "home": "Home",
    "about": "About Us",
    "companyProfile": "Company Profile",
    "factory": "Factory",
    "equipment": "Equipment",
    "qcEquipment": "QC Equipment",
    "machiningEquipment": "Machining Equipment",
    "products": "Products",
    "contact": "Contact Us",
    "download": "Download"
  },
  "home": {
    "headline": "Precision PET Mold Engineering",
    "subheadline": "From preform to bottle — high-performance molds engineered for the world's leading beverage, food, and packaging manufacturers.",
    "exploreProducts": "Explore Products",
    "contactSales": "Contact Sales",
    "productCategories": "Product Categories",
    "productCategoriesSub": "Comprehensive mold solutions spanning the entire PET packaging lifecycle.",
    "coreCapabilities": "Core Capabilities",
    "coreCapabilitiesSub": "Engineered for precision. Built for production.",
    "featuredProducts": "Featured Products",
    "featuredProductsSub": "Our most requested mold systems trusted by industry leaders worldwide.",
    "manufacturing": "World-Class Manufacturing",
    "manufacturingSub": "A 15,000 sqm facility equipped with precision CNC, EDM, and metrology systems from Mazak, Makino, and Zeiss.",
    "more": "MORE"
  },
  "stats": {
    "facility": "sqm Production Facility",
    "cavities": "Max Cavities Per Mold",
    "countries": "Countries Served",
    "experience": "Years of Experience"
  },
  "about": {
    "title": "About Lihe Precision",
    "headline": "Engineering Precision. Delivering Performance."
  },
  "factory": {
    "title": "Our Facility",
    "headline": "15,000 sqm of Precision Manufacturing"
  },
  "equipment": {
    "title": "Equipment & Capabilities",
    "headline": "World-Class Machinery. Micron-Level Precision."
  },
  "products": {
    "title": "Products",
    "allCategories": "All Categories",
    "viewDetails": "View Details",
    "requestQuote": "Request a Quote"
  },
  "contact": {
    "title": "Contact Us",
    "headline": "Get in Touch",
    "intro": "Ready to discuss your mold requirements? Our sales and engineering team is available to provide technical consultation, pricing, and lead time information.",
    "sendMessage": "Send Us a Message",
    "formDescription": "Fill out the form below and our team will respond within 24 business hours.",
    "fullName": "Full Name",
    "companyName": "Company Name",
    "emailAddress": "Email Address",
    "phoneNumber": "Phone Number",
    "subject": "Subject",
    "message": "Message",
    "submit": "Send Message",
    "subjects": {
      "inquiry": "Product Inquiry",
      "consultation": "Technical Consultation",
      "quote": "Request a Quote",
      "support": "After-Sales Support",
      "other": "Other"
    }
  },
  "footer": {
    "tagline": "Precision mold solutions for the global PET packaging industry.",
    "copyright": "Foshan Lihe Precision Machinery Co.,Ltd. All rights reserved."
  },
  "common": {
    "learnMore": "Learn More",
    "backToTop": "Back to Top",
    "breadcrumbHome": "Home"
  }
}
```

**Step 6: Create Russian and Spanish placeholder files**

`src/messages/ru.json` and `src/messages/es.json` — copy structure from en.json, keep English values as placeholders for now.

**Step 7: Commit**

```bash
git add src/i18n/ src/messages/ src/middleware.ts
git commit -m "feat: set up next-intl i18n with en/ru/es locales"
```

---

### Task 4: Set up global styles and CSS variables

**Files:**
- Create: `src/styles/globals.css`
- Create: `src/styles/variables.css`

**Step 1: Create CSS variables**

`src/styles/variables.css`:
```css
:root {
  /* Brand colors */
  --color-primary: #1a365d;
  --color-primary-light: #2a4a7f;
  --color-primary-dark: #0f2341;
  --color-accent: #c9a84c;
  --color-accent-light: #d4b96a;
  --color-accent-dark: #b08f3a;

  /* Neutrals */
  --color-white: #ffffff;
  --color-gray-50: #f8f9fa;
  --color-gray-100: #f1f3f5;
  --color-gray-200: #e9ecef;
  --color-gray-300: #dee2e6;
  --color-gray-400: #ced4da;
  --color-gray-500: #adb5bd;
  --color-gray-600: #868e96;
  --color-gray-700: #495057;
  --color-gray-800: #343a40;
  --color-gray-900: #212529;
  --color-black: #000000;

  /* Typography */
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-heading: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  --space-3xl: 4rem;
  --space-4xl: 6rem;

  /* Container */
  --container-max: 1200px;
  --container-padding: 1rem;

  /* Borders */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
}
```

**Step 2: Create globals.css**

`src/styles/globals.css`:
```css
@import "./variables.css";

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-sans);
  color: var(--color-gray-800);
  background: var(--color-white);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

a {
  color: inherit;
  text-decoration: none;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  line-height: 1.2;
  color: var(--color-primary);
}

.container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

.section {
  padding: var(--space-4xl) 0;
}

@media (max-width: 768px) {
  :root {
    --container-padding: 1rem;
    --space-4xl: 3rem;
  }
}
```

**Step 3: Commit**

```bash
git add src/styles/
git commit -m "feat: add global styles and CSS variables"
```

---

### Task 5: Create root layout and [locale] layout

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/[locale]/layout.tsx`
- Create: `src/app/[locale]/page.tsx` (placeholder)

**Step 1: Create root layout**

`src/app/layout.tsx`:
```typescript
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
```

**Step 2: Create locale layout**

`src/app/[locale]/layout.tsx`:
```typescript
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "@/styles/globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

**Step 3: Create placeholder home page**

`src/app/[locale]/page.tsx`:
```typescript
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("home");
  return (
    <main>
      <h1>{t("headline")}</h1>
      <p>{t("subheadline")}</p>
    </main>
  );
}
```

**Step 4: Verify dev server works**

Run: `npm run dev` — visit http://localhost:3000/en, expect headline text.

**Step 5: Commit**

```bash
git add src/app/
git commit -m "feat: add root layout and locale layout with next-intl"
```

---

## Phase 2: Layout Components (Header + Footer)

### Task 6: Build Header component

**Files:**
- Create: `src/components/layout/Header/Header.tsx`
- Create: `src/components/layout/Header/Header.module.css`
- Create: `src/components/layout/Header/index.ts`
- Create: `src/lib/data.ts` (data loading utility)

**Step 1: Create data loading utility**

`src/lib/data.ts`:
```typescript
import fs from "fs";
import path from "path";

function loadJson<T>(filename: string): T {
  const filePath = path.join(process.cwd(), "data", filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function getSiteData() {
  return loadJson<any>("site.json");
}

export function getHomeData() {
  return loadJson<any>("home.json");
}

export function getAboutData() {
  return loadJson<any>("about.json");
}

export function getFactoryData() {
  return loadJson<any>("factory.json");
}

export function getEquipmentData() {
  return loadJson<any>("equipment.json");
}

export function getContactData() {
  return loadJson<any>("contact.json");
}

export function getProductsData() {
  const filePath = path.join(process.cwd(), "products-data.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}
```

**Step 2: Build Header component**

Build a responsive header with:
- Logo (left)
- Navigation links with dropdowns (center)
- Language switcher (right)
- Mobile hamburger menu

Use data from `site.json` for nav items. Use `next-intl` Link for locale-aware navigation. Use `useTranslations("nav")` for translated labels.

CSS Module: professional dark blue header, white text, gold accent on hover. Sticky on scroll.

**Step 3: Build locale switcher**

Create `src/components/layout/Header/LocaleSwitcher.tsx` — client component that switches between en/ru/es using `useRouter` and `usePathname` from `@/i18n/navigation`.

**Step 4: Verify header renders on all pages**

Add Header to `src/app/[locale]/layout.tsx`.

**Step 5: Commit**

```bash
git add src/components/layout/Header/ src/lib/data.ts
git commit -m "feat: add responsive Header with nav and locale switcher"
```

---

### Task 7: Build Footer component

**Files:**
- Create: `src/components/layout/Footer/Footer.tsx`
- Create: `src/components/layout/Footer/Footer.module.css`
- Create: `src/components/layout/Footer/index.ts`

**Step 1: Build Footer component**

Build footer with:
- Company logo + tagline
- Quick links (About Us, Products, Contact Us)
- Contact info (phone, email, address)
- Social icons (Facebook, Twitter, Pinterest)
- Copyright line

Use data from `site.json` footer object. Dark background (#0f2341), white/gray text, gold accent links.

**Step 2: Add Footer to locale layout**

Update `src/app/[locale]/layout.tsx` to include Footer below `{children}`.

**Step 3: Verify layout**

Run: `npm run dev` — verify header and footer render correctly on `/en`.

**Step 4: Commit**

```bash
git add src/components/layout/Footer/ src/app/[locale]/layout.tsx
git commit -m "feat: add Footer with contact info and social links"
```

---

## Phase 3: UI Components

### Task 8: Build shared UI components

**Files:**
- Create: `src/components/ui/Button/Button.tsx`
- Create: `src/components/ui/Button/Button.module.css`
- Create: `src/components/ui/Button/index.ts`
- Create: `src/components/ui/Breadcrumb/Breadcrumb.tsx`
- Create: `src/components/ui/Breadcrumb/Breadcrumb.module.css`
- Create: `src/components/ui/Breadcrumb/index.ts`
- Create: `src/components/ui/SectionHeading/SectionHeading.tsx`
- Create: `src/components/ui/SectionHeading/SectionHeading.module.css`
- Create: `src/components/ui/SectionHeading/index.ts`
- Create: `src/components/ui/ImageGallery/ImageGallery.tsx`
- Create: `src/components/ui/ImageGallery/ImageGallery.module.css`
- Create: `src/components/ui/ImageGallery/index.ts`

**Step 1: Build Button**

Variants: `primary` (gold bg), `secondary` (dark blue outline), `ghost` (transparent). Sizes: `sm`, `md`, `lg`. Renders as `<a>` when `href` is provided, `<button>` otherwise.

**Step 2: Build Breadcrumb**

Props: `items: { label: string; href?: string }[]`. Renders `Home > Section > Page` with links.

**Step 3: Build SectionHeading**

Props: `title: string`, `subtitle?: string`, `align?: "left" | "center"`. Used for all section titles on all pages.

**Step 4: Build ImageGallery**

Client component. Props: `images: { src: string; alt: string }[]`. Thumbnail grid + lightbox modal on click. Used on product detail and equipment pages.

**Step 5: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add shared UI components (Button, Breadcrumb, SectionHeading, ImageGallery)"
```

---

## Phase 4: Home Page

### Task 9: Build Home page components

**Files:**
- Create: `src/components/home/HeroBanner/HeroBanner.tsx`
- Create: `src/components/home/HeroBanner/HeroBanner.module.css`
- Create: `src/components/home/HeroBanner/index.ts`
- Create: `src/components/home/Stats/Stats.tsx`
- Create: `src/components/home/Stats/Stats.module.css`
- Create: `src/components/home/Stats/index.ts`
- Create: `src/components/home/CategoryShowcase/CategoryShowcase.tsx`
- Create: `src/components/home/CategoryShowcase/CategoryShowcase.module.css`
- Create: `src/components/home/CategoryShowcase/index.ts`
- Create: `src/components/home/FeaturedProducts/FeaturedProducts.tsx`
- Create: `src/components/home/FeaturedProducts/FeaturedProducts.module.css`
- Create: `src/components/home/FeaturedProducts/index.ts`
- Modify: `src/app/[locale]/page.tsx`

**Step 1: Build HeroBanner**

Client component with image slideshow (CSS transitions, auto-rotate every 5s). Overlay with headline, subheadline, two CTA buttons. Full viewport height. Data from `home.json` banners.

**Step 2: Build Stats**

4-column grid showing stats (15,000+ sqm, 160 cavities, 50+ countries, 20+ years). Counter animation on scroll into view. Dark blue background section.

**Step 3: Build CategoryShowcase**

5 category cards with background image, overlay title + short description. Hover zoom effect. Links to product/equipment pages. Data from `home.json` showcaseCategories.

**Step 4: Build FeaturedProducts**

Product card grid showing featured items from `products-data.json`. Card: thumbnail, name, category tag, "MORE" link. Two tabs: "Hot" / "Latest".

**Step 5: Assemble Home page**

Update `src/app/[locale]/page.tsx` to compose: HeroBanner → Stats → CategoryShowcase → FeaturedProducts → Factory CTA section.

Add metadata:
```typescript
export async function generateMetadata({ params }: Props) {
  return {
    title: "Lihe Precision | PET Mold Engineering",
    description: "High-performance PET preform molds, blow molds, and hot runner systems. 15,000 sqm facility serving 50+ countries.",
  };
}
```

**Step 6: Verify**

Run: `npm run dev` — visit `/en`, verify all sections render with data and images.

**Step 7: Commit**

```bash
git add src/components/home/ src/app/[locale]/page.tsx
git commit -m "feat: build complete Home page with hero, stats, showcase, featured products"
```

---

## Phase 5: Content Pages

### Task 10: Build About page

**Files:**
- Create: `src/app/[locale]/about/page.tsx`
- Create: `src/app/[locale]/about/page.module.css`

**Step 1: Build About page**

Sections:
1. Banner image with page title overlay
2. Company introduction (companyIntro + philosophy + business from about.json)
3. "Why Lihe" — 4 cards in a grid (whyLihe from about.json)
4. Core Values — 4 value blocks (values from about.json)

Add SEO metadata.

**Step 2: Commit**

```bash
git add src/app/[locale]/about/
git commit -m "feat: build About page with company intro and values"
```

---

### Task 11: Build Factory page

**Files:**
- Create: `src/app/[locale]/factory/page.tsx`
- Create: `src/app/[locale]/factory/page.module.css`

**Step 1: Build Factory page**

Sections:
1. Banner with headline
2. Intro paragraph
3. Factory sections from factory.json — each section with image, title, description
4. Production Workshop subsection with 3 item cards
5. Global Sales Network, After-Sale, Custom Solutions text sections

Add SEO metadata.

**Step 2: Commit**

```bash
git add src/app/[locale]/factory/
git commit -m "feat: build Factory page with facility sections"
```

---

### Task 12: Build Equipment pages

**Files:**
- Create: `src/app/[locale]/equipment/page.tsx`
- Create: `src/app/[locale]/equipment/page.module.css`
- Create: `src/app/[locale]/equipment/qc/page.tsx`
- Create: `src/app/[locale]/equipment/machining/page.tsx`

**Step 1: Build Equipment overview page**

Banner + intro + 2 category cards linking to QC and Machining sub-pages. Data from equipment.json.

**Step 2: Build QC Equipment page**

Banner, description, highlights list, image gallery (6 images). Uses ImageGallery component.

**Step 3: Build Machining Equipment page**

Same layout as QC. Banner, description, highlights list, image gallery (6 images).

**Step 4: Commit**

```bash
git add src/app/[locale]/equipment/
git commit -m "feat: build Equipment overview, QC, and Machining pages"
```

---

### Task 13: Build Products pages

**Files:**
- Create: `src/components/products/ProductCard/ProductCard.tsx`
- Create: `src/components/products/ProductCard/ProductCard.module.css`
- Create: `src/components/products/ProductCard/index.ts`
- Create: `src/components/products/ProductGrid/ProductGrid.tsx`
- Create: `src/components/products/ProductGrid/ProductGrid.module.css`
- Create: `src/components/products/ProductGrid/index.ts`
- Create: `src/components/products/CategoryFilter/CategoryFilter.tsx`
- Create: `src/components/products/CategoryFilter/CategoryFilter.module.css`
- Create: `src/components/products/CategoryFilter/index.ts`
- Create: `src/app/[locale]/products/page.tsx`
- Create: `src/app/[locale]/products/page.module.css`
- Create: `src/app/[locale]/products/[id]/page.tsx`
- Create: `src/app/[locale]/products/[id]/page.module.css`

**Step 1: Build ProductCard**

Props: product object. Shows: thumbnail, name, category badge, short description, "View Details" link. Hover shadow effect.

**Step 2: Build CategoryFilter**

Client component. Horizontal pill/tab filter. "All Categories" + 9 category names from products-data.json. Filters ProductGrid on click. URL search param `?category=slug`.

**Step 3: Build ProductGrid**

Responsive grid (3 cols desktop, 2 tablet, 1 mobile) of ProductCard components.

**Step 4: Build Products list page**

Breadcrumb, SectionHeading, CategoryFilter, ProductGrid. Load all products from products-data.json. Add generateStaticParams for locales.

**Step 5: Build Product detail page**

Page shows: Breadcrumb, product name, category, full description, ImageGallery for all images, "Request a Quote" CTA button linking to /contact.

```typescript
export function generateStaticParams() {
  const data = getProductsData();
  const locales = routing.locales;
  return locales.flatMap((locale) =>
    data.products.map((p: any) => ({ locale, id: String(p.id) }))
  );
}
```

**Step 6: Commit**

```bash
git add src/components/products/ src/app/[locale]/products/
git commit -m "feat: build Products list with category filter and detail pages"
```

---

### Task 14: Build Contact page

**Files:**
- Create: `src/app/[locale]/contact/page.tsx`
- Create: `src/app/[locale]/contact/page.module.css`

**Step 1: Build Contact page**

Two-column layout:
- Left: Contact info (name, phone, email, address) with icons
- Right: Contact form (fields from contact.json formFields)

Form is static (no backend). On submit, construct `mailto:` link or show a success message placeholder.

Map section: Embed a static map image or placeholder for Foshan location.

**Step 2: Commit**

```bash
git add src/app/[locale]/contact/
git commit -m "feat: build Contact page with form and contact info"
```

---

### Task 15: Build Download page

**Files:**
- Create: `src/app/[locale]/download/page.tsx`
- Create: `src/app/[locale]/download/page.module.css`

**Step 1: Build Download page**

Simple page with breadcrumb, heading, and placeholder content (download section to be populated later with catalog PDFs).

**Step 2: Commit**

```bash
git add src/app/[locale]/download/
git commit -m "feat: build Download page placeholder"
```

---

## Phase 6: SEO & Meta

### Task 16: Add SEO metadata, sitemap, and robots.txt

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Modify: `src/app/[locale]/layout.tsx` (add default metadata)
- Create: `src/components/seo/JsonLd.tsx`

**Step 1: Add default metadata to locale layout**

```typescript
export const metadata = {
  metadataBase: new URL("https://lihe-preform.com"),
  title: {
    default: "Lihe Precision | PET Mold Engineering",
    template: "%s | Lihe Precision",
  },
  description: "High-performance PET preform molds, blow molds, compression molds, and hot runner systems from Foshan Lihe Precision Machinery.",
  openGraph: {
    type: "website",
    siteName: "Lihe Precision Machinery",
  },
};
```

**Step 2: Create sitemap.ts**

Generate sitemap entries for all locales × all pages + all product detail pages.

**Step 3: Create robots.ts**

Allow all crawlers, point to sitemap.

**Step 4: Create JSON-LD component**

Organization schema on layout. Product schema on product detail pages.

**Step 5: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts src/components/seo/
git commit -m "feat: add SEO metadata, sitemap, robots.txt, and JSON-LD"
```

---

## Phase 7: Build & Deploy

### Task 17: Build verification and Cloudflare Pages setup

**Step 1: Run static build**

```bash
npm run build
```

Expect: successful build with `out/` directory containing all static pages for en/ru/es locales.

**Step 2: Verify output**

```bash
ls out/en/
ls out/en/products/
```

Expect: index.html for each route.

**Step 3: Push to GitHub**

```bash
git add -A
git commit -m "feat: complete website build — ready for deployment"
git push -u origin main
```

**Step 4: Configure Cloudflare Pages**

- Connect GitHub repo: lovemage/lihe_preform
- Build command: `npm run build`
- Output directory: `out`
- Add custom domain: lihe-preform.com

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-5 | Project scaffold, config, i18n, styles, layout |
| 2 | 6-7 | Header and Footer layout components |
| 3 | 8 | Shared UI components |
| 4 | 9 | Home page (hero, stats, showcase, featured) |
| 5 | 10-15 | Content pages (About, Factory, Equipment, Products, Contact, Download) |
| 6 | 16 | SEO metadata, sitemap, JSON-LD |
| 7 | 17 | Build verification and deployment |

Total: **17 tasks**, **7 phases**
