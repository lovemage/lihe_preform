# Lihe Preform Official Website Rebuild — Design Document

## Overview

Rebuild the Foshan Lihe Precision Machinery corporate website using modern web technologies. The site targets B2B buyers in the global PET packaging industry.

## Tech Stack

| Item | Choice |
|------|--------|
| Framework | Next.js 15 (App Router, Static Export) |
| Styling | CSS Modules |
| i18n | next-intl (en / ru / es, English first) |
| Deployment | Cloudflare Pages (`output: "export"`) |
| Git | https://github.com/lovemage/lihe_preform.git |
| Domain | lihe-preform.com |
| Contact Email | sales@lihe-preform.com |
| Phone | +886 938 198 675 |

## Design Direction

- **Style**: Professional corporate / industrial B2B
- **Color**: Dark blue (#1a365d) + gold accent (#c9a84c)
- **Tone**: Authoritative, data-driven, targeting procurement decision-makers
- **Responsive**: Desktop / Tablet / Mobile

## Route Structure

```
/[locale]/                      → Home
/[locale]/about                 → About Us
/[locale]/factory               → Factory Tour
/[locale]/equipment             → Equipment Overview
/[locale]/equipment/qc          → QC Equipment
/[locale]/equipment/machining   → Machining Equipment
/[locale]/products              → Products (category filter)
/[locale]/products/[id]         → Product Detail
/[locale]/contact               → Contact Us
/[locale]/download              → Downloads
```

Default locale: `en`. Visiting `/` redirects to `/en`.

## File Structure

```
src/
├── app/
│   └── [locale]/
│       ├── layout.tsx
│       ├── page.tsx              # Home
│       ├── about/page.tsx
│       ├── factory/page.tsx
│       ├── equipment/
│       │   ├── page.tsx
│       │   ├── qc/page.tsx
│       │   └── machining/page.tsx
│       ├── products/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── contact/page.tsx
│       └── download/page.tsx
├── components/
│   ├── layout/
│   │   ├── Header/
│   │   └── Footer/
│   ├── home/
│   │   ├── HeroBanner/
│   │   ├── Stats/
│   │   ├── CategoryShowcase/
│   │   └── FeaturedProducts/
│   ├── products/
│   │   ├── ProductCard/
│   │   ├── ProductGrid/
│   │   └── CategoryFilter/
│   └── ui/
│       ├── Button/
│       ├── Breadcrumb/
│       └── ImageGallery/
├── i18n/
│   ├── en.json
│   ├── ru.json
│   ├── es.json
│   └── request.ts
├── data/          # Existing JSON data files
└── public/images/ # Existing webp images
```

## Data Layer

All content is stored in `data/*.json` and `products-data.json` (already prepared):

- `site.json` — nav, footer, logo, contact info
- `home.json` — hero, banners, stats, categories, showcase
- `about.json` — company intro, values, why-lihe
- `factory.json` — facility sections with descriptions
- `equipment.json` — QC and machining equipment details
- `contact.json` — contact info, form fields
- `products-data.json` — 41 products across 9 categories

## i18n Strategy

- Use `next-intl` with App Router middleware
- Translation files in `src/i18n/{locale}.json`
- English content complete; Russian and Spanish to be added later
- Locale prefix in all routes: `/en/`, `/ru/`, `/es/`

## SEO

- Per-page `metadata` (title, description, openGraph)
- Auto-generated `sitemap.xml` and `robots.txt`
- JSON-LD structured data (Organization, Product)
- All images use descriptive alt text (already prepared)
- WebP format for all images (already converted)

## Deployment

- `next.config.js`: `output: "export"` for static generation
- Deploy to Cloudflare Pages from GitHub
- Build command: `npm run build`
- Output directory: `out/`
