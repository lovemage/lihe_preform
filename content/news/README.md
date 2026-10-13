# News articles — authoring guide

One article = one file `content/news/<slug>.json` containing all three
locales. `node scripts/build-news.mjs` validates every file and writes
`data/{en,ru,es}/news.json`. Never edit `data/*/news.json` by hand.

## File format

```json
{
  "slug": "kebab-case-slug-equal-to-file-name",
  "questionId": "q101",
  "date": "2026-10-13",
  "relatedProducts": [19, 27],
  "images": {
    "hero": "/images/news/<slug>-hero.webp",
    "detail": "/images/news/<slug>-detail.webp",
    "og": "/images/news/<slug>-hero-og.jpg"
  },
  "sources": [
    { "label": "Wikipedia — Preform", "url": "https://en.wikipedia.org/wiki/Preform" }
  ],
  "locales": {
    "en": {
      "category": "Technical Insights",
      "title": "...",
      "summary": "1–2 sentences, used as meta description",
      "heroAlt": "...",
      "detailAlt": "...",
      "sections": [
        { "heading": "...", "paragraphs": ["..."] },
        { "heading": "...", "list": ["..."] },
        { "heading": "...", "steps": ["...", "..."] },
        { "heading": "...", "table": { "head": ["", "A", "B"], "rows": [["Row", "a", "b"]] } }
      ],
      "faq": [{ "question": "...", "answer": "..." }]
    },
    "ru": { "category": "Технические статьи", "...": "same shape" },
    "es": { "category": "Artículos técnicos", "...": "same shape" }
  }
}
```

- A section may combine `paragraphs`, `list`, `steps` and `table`.
- `steps` are rendered as "Step 1:", "Step 2:" … automatically — do not number them yourself.
- The page renders FAQ and References sections automatically from `faq` and `sources`.
- `relatedProducts` uses product ids from `data/en/products-data.json`.

## Content requirements (GEO audit acceptance criteria)

- EN ≥ 1,200 words; RU/ES ≥ 1,000 words. RU/ES are full translations, not summaries.
- ≥ 6 sections (plus the automatic FAQ and References = ≥ 8 H2).
- Title must contain the wording of the target question.
- First section answers the question directly in 2–3 sentences, and contains a definition sentence ("X is a …" / "X refers to …").
- At least one comparison table, one `steps` list (≥ 3 steps), ≥ 3 FAQ items.
- At least 3 numbers with units (%, days, weeks, mm, cavities, °C …) — only from `content/FACTS.md` or a cited source.
- Prefer lists over long paragraphs (list density ≥ 0.35).
- `sources`: ≥ 3 external references (Wikipedia, EUR-Lex, standards bodies, machine makers' official sites). Every URL must return HTTP 200 — check with `curl -sIL`.

## Accuracy rules

- LIHE facts come only from `content/FACTS.md`. Never invent prices, customers, certifications, cycle times or warranties.
- Pricing questions: explain cost drivers and the published 25%–40% retrofit figure; say exact prices require a quote.
- Competitors: describe only what their official websites state, cite the URL in `sources`, stay neutral, and disclose that this article is published by LIHE.
- General engineering knowledge (how PET preform molding works, what AA is, etc.) is fine if it is standard, uncontroversial and correct.
- Tone: plain, technical, buyer-oriented. No hype words ("world-class", "best-in-class", "revolutionary").
