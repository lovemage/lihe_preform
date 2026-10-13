# Page guides — authoring guide

A page guide is long-form reference content rendered below a page's existing
content (product detail, category, home, about, …). It closes the GEO audit
gaps on every page: definition, numbers, comparison, steps, FAQ, visible date,
author and external references.

One guide = one file `content/guides/<key>.json` with all three locales.
`node scripts/build-guides.mjs` validates every file and writes
`data/{en,ru,es}/guides.json`. Never edit `data/*/guides.json` by hand.

Keys: `page-home`, `page-about`, `page-factory`, `page-equipment`, `page-qc`,
`page-machining`, `page-products`, `page-contact`, `page-download`,
`page-news`, `category-<slug>` (slugs in `src/lib/categories.ts`),
`product-<id>` (ids in `data/en/products-data.json`).

## File format

```json
{
  "key": "product-19",
  "updated": "2026-10-13",
  "sources": [
    { "label": "Wikipedia — Preform", "url": "https://en.wikipedia.org/wiki/Preform" }
  ],
  "locales": {
    "en": {
      "heading": "PET preform mold guide: cavitation, neck finishes and machine compatibility",
      "intro": "2–3 sentences that answer what this page is about, with a definition sentence.",
      "sections": [
        { "heading": "...", "paragraphs": ["..."], "list": ["..."] },
        { "heading": "...", "table": { "head": ["", "A", "B"], "rows": [["Row", "a", "b"]] } },
        { "heading": "...", "steps": ["...", "..."] }
      ],
      "faq": [{ "question": "...", "answer": "..." }]
    },
    "ru": { "...": "same shape, full translation" },
    "es": { "...": "same shape, full translation" }
  }
}
```

The renderer adds the "Updated <date> · Author: LIHE Precision Engineering
Team" line, "Step N:" labels, the FAQ heading and the References list.

## Requirements (validator enforces them)

- EN ≥ 900 words, RU/ES ≥ 800 words (aim for 1,000+ / 900+). RU/ES are complete, natural translations.
- ≥ 5 sections (with FAQ and References that is ≥ 7 H2; aim for 6–8 sections).
- `intro` contains a definition sentence ("X is a …" / "X refers to …"; RU "… — это …"; ES "… es un/una …").
- ≥ 1 comparison table, ≥ 1 `steps` list with ≥ 3 steps (unnumbered), ≥ 4 FAQ items.
- ≥ 3 numbers with units (%, days, weeks, mm, cavities, °C, seconds, g …).
- Prefer lists to long paragraphs.
- `sources`: ≥ 4 external references; every URL must return HTTP 200 (`curl -sIL -o /dev/null -w '%{http_code}' <url>`).
- Headings should use the words buyers search for (e.g. "PET preform mold", "hot runner", "blow mold", "Husky", "SACMI", "cavitation", "cycle time", "replacement", "lightweight", "rPET").

## Accuracy rules

- LIHE-specific facts ONLY from `content/FACTS.md`. Never invent prices, customers, certifications, cycle times, warranties or specs.
- Read the page's existing content first (e.g. the product in `data/en/products-data.json`, `data/en/about.json`) — the guide must add to it, not repeat it, and must not contradict it.
- Pages on the same topic (e.g. `page-qc`, `product-18`, `category-qc-equipment`) must each take a clearly different angle so they are not duplicates.
- General engineering knowledge must be standard and correct; don't invent numeric process settings unless the number is cited in `sources`.
- Tone: plain, technical, buyer-oriented. No hype words.
