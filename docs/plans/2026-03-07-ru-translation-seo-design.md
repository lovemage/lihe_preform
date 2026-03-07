# Russian Full Translation + Yandex SEO Optimization — Design Document

## Overview

Fully translate all website content into professional Russian, and optimize for Yandex search engine with three-tier keyword strategy targeting the Russian/CIS PET packaging market.

## Problem

Currently only UI chrome (nav, buttons, form labels) is translated to Russian via `src/messages/ru.json`. All substantive content in `data/*.json` and `products-data.json` remains English-only. Russian-speaking users see Russian navigation wrapping English content — unprofessional and terrible for Yandex SEO.

## Scope

### In Scope

- Restructure `data/` directory into per-locale subdirectories
- Translate all data-layer content into Russian (6 JSON files + products)
- Review and refine existing `src/messages/ru.json` to align with industry terminology
- Three-tier Yandex SEO keyword optimization
- Update `src/lib/data.ts` to load locale-specific data files

### Out of Scope

- Spanish (es) translation updates
- Frontend component JSX changes
- New page routes
- UI/UX redesign

## Data Architecture

### Current Structure

```
data/
├── about.json        (English only)
├── factory.json      (English only)
├── equipment.json    (English only)
├── home.json         (English only)
├── contact.json      (English only)
└── site.json         (English only)
products-data.json    (English only)
```

### New Structure

```
data/
├── en/
│   ├── about.json
│   ├── factory.json
│   ├── equipment.json
│   ├── home.json
│   ├── contact.json
│   └── products-data.json
├── ru/
│   ├── about.json
│   ├── factory.json
│   ├── equipment.json
│   ├── home.json
│   ├── contact.json
│   └── products-data.json
└── site.json          (shared: image paths, hrefs, non-translatable data)
```

- `src/lib/data.ts` modified to accept `locale` parameter and load from `data/{locale}/`
- Image paths, hrefs, and structural data remain shared or duplicated in each locale file (avoid over-engineering the split)

## Translation Scope

| File | Content to Translate |
|------|---------------------|
| `about.json` | Company intro, philosophy, business description, "Why Lihe" sections, values |
| `factory.json` | Section titles, descriptions for each facility area |
| `equipment.json` | Category names, descriptions, technical highlights |
| `home.json` | Showcase descriptions, category names, section headings/subtitles |
| `contact.json` | Page intro text, form descriptions |
| `products-data.json` | Product names, category names, descriptions (41 products, 9 categories) |
| `ru.json` (messages) | Review and refine existing translations for terminology consistency |

## SEO Keyword Strategy (Three Tiers)

### Tier 1: Core Product Keywords

Target: meta title, meta description, H1, homepage hero

| Russian | English |
|---------|---------|
| Пресс-форма для ПЭТ-преформ | PET preform mold |
| Выдувная форма для ПЭТ | PET blow mold |
| Горячеканальная система | Hot runner system |
| Компрессионная пресс-форма | Compression mold |
| Пресс-форма для колпачков | Closure/cap mold |
| Многогнездная пресс-форма | Multi-cavity mold |

### Tier 2: Equipment Compatibility Keywords

Target: product descriptions, equipment pages

| Russian | English |
|---------|---------|
| Пресс-формы для HUSKY | Molds for HUSKY |
| Пресс-формы для NETSTAL | Molds for NETSTAL |
| Пресс-формы для SIPA | Molds for SIPA |
| Формы для термопластавтоматов | Molds for injection molding machines |
| Совместимость с SIDEL / KRONES / KHS | Compatible with SIDEL / KRONES / KHS |

### Tier 3: Application Scenario Keywords (Long-tail)

Target: product detail pages, image alt text

| Russian | English |
|---------|---------|
| Формы для ПЭТ-бутылок для воды | PET water bottle molds |
| Многогнездная пресс-форма 160 гнезд | 160-cavity multi-cavity mold |
| Пресс-формы для пищевой упаковки | Food packaging molds |
| Формы для производства напитков | Beverage production molds |
| Пресс-формы для выдува ПЭТ-тары | PET container blow molds |
| Оснастка для литья преформ | Preform injection tooling |

### Keyword Placement Rules

- Every page `metaDescription` rewritten with tier-1 keywords
- Product descriptions naturally incorporate tier-2 and tier-3 keywords
- Image alt text includes Russian descriptions (benefits Yandex image search)
- H1/H2 headings use tier-1 keywords where natural

## Terminology Reference

Based on `reseach_ru0305.md` industry glossary:

| Russian | Chinese | English |
|---------|---------|---------|
| Преформа (ПЭТ) | PET 预形体 | PET Preform |
| Пресс-форма | 模具 | Mold |
| Термопластавтомат (ТПА) | 射出成型机 | Injection Molding Machine |
| Выдувное оборудование | 吹瓶设备 | Blow Molding Equipment |
| Полиэтилентерефталат (ПЭТ/ПЭТФ) | PET | PET (Polyethylene Terephthalate) |
| Горячеканальная система | 热流道系统 | Hot Runner System |
| Литье под давлением | 射出成型 | Injection Molding |
| Выдувное формование | 吹塑成型 | Blow Molding |
| Вторичный ПЭТ (рПЭТ) | 再生 PET | Recycled PET (rPET) |

## Implementation Notes

- English data files are created by moving existing content — no content changes
- Russian translations must read naturally, not as machine translation
- SEO keywords should be woven into content naturally, not keyword-stuffed
- Product descriptions that are currently duplicated across products should remain consistent in Russian
- `data/site.json` keeps shared non-translatable data (image paths, social links, footer links)
