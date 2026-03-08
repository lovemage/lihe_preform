# Dynamic SEO LD-JSON Implementation Recommendation

**Date**: 2026-03-08
**Status**: Proposal
**Context**: Migration to OpenNext + D1 Database Architecture

## Executive Summary

After migrating to OpenNext with Cloudflare D1, the project has a **hybrid data architecture**:
- **Static JSON files** in `data/{locale}/` for frontend rendering (compiled at build time)
- **D1 Database** for admin CRUD operations with publish-to-JSON workflow

**Recommendation**: **KEEP static LD-JSON for now**, but prepare for dynamic SEO in Phase 2.

---

## Current Architecture Analysis

### 1. Data Flow (As-Is)

```
Admin Edit (D1) → Publish Script → JSON Files → Static Import → Next.js Build → LD-JSON
```

**Key Files:**
- [src/lib/data.ts:1-105](src/lib/data.ts#L1-L105) - Static imports from `data/{locale}/*.json`
- [src/lib/admin/content-repository.ts:459-516](src/lib/admin/content-repository.ts#L459-L516) - Publish scripts
- [wrangler.json:26-31](wrangler.json#L26-L31) - D1 binding configuration

### 2. Current SEO Implementation

#### Static LD-JSON (Global)
**Location**: [src/app/(site)/[locale]/layout.tsx:125-161](src/app/(site)/[locale]/layout.tsx#L125-L161)

```typescript
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Foshan Lihe Precision Machinery Co.,Ltd.",
  // ... hardcoded data
};
```

**Issues**:
- ✅ Works perfectly for static organization/website data
- ✅ Cached at build time for performance
- ❌ Cannot reflect real-time admin changes
- ❌ Requires rebuild + redeploy for updates

#### Static LD-JSON (Product Pages)
**Location**: [src/app/(site)/[locale]/products/[id]/page.tsx:68-88](src/app/(site)/[locale]/products/[id]/page.tsx#L68-L88)

```typescript
const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,  // From static JSON
  sku: String(product.id),
  // ... all data from getProductsData(locale)
};
```

**Issues**:
- ✅ Generated at build time (SSG)
- ✅ Fast page loads
- ❌ Product updates require rebuild
- ❌ SEO changes not reflected until next deployment

---

## Analysis: Static vs Dynamic LD-JSON

### Option A: Keep Static LD-JSON (Current + Recommended)

**Pros**:
1. ✅ **Zero runtime cost** - LD-JSON baked into HTML at build time
2. ✅ **Optimal SEO crawlability** - Static HTML immediately available
3. ✅ **Cloudflare Workers compatibility** - No DB query on every request
4. ✅ **ISR support** - Can use `revalidate` for periodic updates
5. ✅ **Predictable performance** - No DB latency variability

**Cons**:
1. ❌ Admin changes require `npm run content:publish` + rebuild
2. ❌ No real-time SEO updates
3. ❌ Dual maintenance (D1 + JSON files)

**Best for**:
- Static product catalogs with infrequent changes
- When rebuild/revalidate workflow is acceptable
- OpenNext SSG/ISR deployment patterns

### Option B: Dynamic LD-JSON from D1

**Pros**:
1. ✅ Real-time SEO updates without rebuild
2. ✅ Single source of truth (D1)
3. ✅ Admin changes immediately reflected

**Cons**:
1. ❌ **DB query on every page request** - Adds 20-50ms latency
2. ❌ **Cloudflare Workers D1 limits**:
   - Free tier: 5M reads/day, 100K writes/day
   - Paid: $5/month base + $0.001/1K reads
3. ❌ Requires API route or server component changes
4. ❌ Complex caching strategy needed
5. ❌ Potential SEO crawler timeout issues at scale

**Best for**:
- High-frequency content updates (news, inventory)
- When real-time accuracy is critical
- When rebuild overhead is unacceptable

---

## Technical Constraints: OpenNext + Cloudflare Workers

### Current Build Configuration
```json
// package.json
"scripts": {
  "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
  "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"
}
```

**OpenNext Static Generation**:
- `generateStaticParams()` creates HTML files at build time
- Assets served from `.open-next/assets` (see [wrangler.json:22-25](wrangler.json#L22-L25))
- Worker handles routing but HTML is pre-rendered

**D1 Runtime Access**:
- Available via `process.env.CONTENT_DB` in server components
- Must use dynamic rendering: `export const dynamic = 'force-dynamic'`
- Bypasses OpenNext static optimization

---

## Recommendation: Phased Approach

### Phase 1: Optimize Current Static Architecture (Recommended NOW)

**Goal**: Keep static LD-JSON but improve DX and automation

#### 1.1 Enhance Publish Workflow
Add automatic rebuild trigger after publish:

```typescript
// scripts/publish-and-rebuild.mjs
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function publishAndRebuild() {
  // Run existing publish scripts
  await import('./publish-content.mjs');

  // Trigger rebuild (choose deployment method)
  console.log('Publishing complete. Rebuild required.');
  console.log('Run: npm run build && npm run deploy');

  // Optional: Auto-deploy if in CI/CD
  if (process.env.AUTO_DEPLOY === 'true') {
    await execAsync('npm run deploy');
  }
}

publishAndRebuild();
```

#### 1.2 Add ISR for Product Pages
Modify [src/app/(site)/[locale]/products/[id]/page.tsx](src/app/(site)/[locale]/products/[id]/page.tsx):

```typescript
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }) {
  // Existing code
}
```

**Benefits**:
- Product pages refresh hourly without full rebuild
- Admin can see changes within 1 hour
- Zero runtime DB queries

#### 1.3 Add JSON-LD Validation
Create [src/lib/seo/validate-jsonld.ts](src/lib/seo/validate-jsonld.ts):

```typescript
import { z } from 'zod';

const ProductSchema = z.object({
  '@context': z.literal('https://schema.org'),
  '@type': z.literal('Product'),
  name: z.string().min(1),
  sku: z.string(),
  description: z.string(),
  image: z.array(z.string().url()),
  brand: z.object({
    '@type': z.literal('Brand'),
    name: z.string(),
  }),
});

export function validateProductJsonLd(data: unknown) {
  return ProductSchema.safeParse(data);
}
```

**Usage in page.tsx**:
```typescript
const productJsonLd = { /* ... */ };

if (process.env.NODE_ENV === 'development') {
  const result = validateProductJsonLd(productJsonLd);
  if (!result.success) {
    console.error('Invalid Product JSON-LD:', result.error);
  }
}
```

---

### Phase 2: Selective Dynamic SEO (Future)

**When to implement**:
- Admin complains about rebuild friction
- Product update frequency > 10/day
- Need real-time inventory in LD-JSON

#### 2.1 Hybrid Architecture
Keep static for:
- Organization LD-JSON (never changes)
- Website LD-JSON (rarely changes)
- Category pages (rebuild is fine)

Add dynamic for:
- Individual product pages (if needed)
- Real-time pricing/availability

#### 2.2 Implementation Pattern
Create [src/lib/seo/dynamic-jsonld.ts](src/lib/seo/dynamic-jsonld.ts):

```typescript
import { getProductById } from '@/lib/admin/content-repository';
import { cache } from 'react';

// Dedupe requests during render
export const getProductJsonLd = cache(async (id: number, locale: string) => {
  const product = await getProductById(id);
  if (!product) return null;

  const translation = product.translations[locale] ?? product.translations.en;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: translation.name,
    sku: String(product.id),
    description: translation.description,
    // ... build from D1 data
  };
});
```

**Update page.tsx**:
```typescript
export const dynamic = 'force-dynamic'; // Opt into SSR

export default async function ProductDetailPage({ params }) {
  const { locale, id } = await params;

  // Fetch from D1 instead of static JSON
  const productJsonLd = await getProductJsonLd(Number(id), locale);

  return (
    <div>
      {productJsonLd && <JsonLd data={productJsonLd} />}
      {/* ... rest of page */}
    </div>
  );
}
```

#### 2.3 Add D1 Caching Layer
```typescript
// src/lib/cache/d1-cache.ts
const CACHE_TTL = 3600; // 1 hour

export async function getCachedProduct(id: number) {
  const cacheKey = `product:${id}`;

  // Try cache first (KV or in-memory)
  const cached = await getFromCache(cacheKey);
  if (cached) return cached;

  // Fallback to D1
  const product = await getProductById(id);
  await setCache(cacheKey, product, CACHE_TTL);

  return product;
}
```

---

## Cost Analysis: D1 Usage

### Current Static Approach
- **Build time**: ~2 min (one-time)
- **Deployment**: ~1 min
- **Runtime queries**: 0
- **Monthly cost**: $0 (assuming Workers free tier)

### Dynamic Approach (Estimated)
**Assumptions**:
- 100 products
- 10,000 page views/day
- 2 DB queries per product page (product + media)

**D1 Usage**:
- Daily reads: 10,000 views × 2 queries = 20,000 reads
- Monthly reads: 600,000 reads

**Cloudflare D1 Pricing**:
- Free tier: 5M reads/month → **$0**
- Paid tier (if exceeded): $0.001/1K reads → **$0.60/month**

**Trade-off**:
- Save ~3 min rebuild time per publish
- Add ~30ms latency per request
- Minimal cost impact

---

## Specific Recommendations

### For Current Project (Lihe Preform)

**Do NOT switch to dynamic LD-JSON because**:
1. Product catalog is **relatively stable** (~41 products, infrequent changes)
2. OpenNext SSG provides **optimal performance**
3. ISR can handle periodic updates (every 1 hour)
4. Static LD-JSON is **SEO best practice** (instant crawlability)

**DO implement these improvements**:

1. **Add ISR to product pages** (30 min)
   - Add `export const revalidate = 3600` to [page.tsx](src/app/(site)/[locale]/products/[id]/page.tsx)
   - Product SEO updates within 1 hour without rebuild

2. **Create unified publish script** (1 hour)
   - Combine `content:publish` with optional auto-deploy
   - Add success notifications to admin UI

3. **Add LD-JSON validation** (45 min)
   - Use Zod schemas to catch SEO data errors
   - Add to development build process

4. **Document SEO update workflow** (15 min)
   - Create `docs/seo-workflow.md`
   - Admin instructions: Edit → Publish → Wait 1 hour (ISR)

### When to Reconsider Dynamic LD-JSON

**Triggers**:
- Admin publishes > 5 times/day
- Real-time pricing/inventory needed
- Product count > 1000 (rebuild becomes slow)
- Customer demand for instant updates

**Migration Path**:
1. Start with one page type (e.g., product detail)
2. Add D1 query + KV cache layer
3. Monitor D1 usage and latency
4. Expand to other pages if successful

---

## Action Items

### Immediate (Week 1)
- [ ] Add ISR revalidation to product pages
- [ ] Create `scripts/publish-and-rebuild.mjs`
- [ ] Update `package.json` scripts section
- [ ] Test ISR behavior with `npm run preview`

### Short-term (Week 2-3)
- [ ] Implement LD-JSON validation with Zod
- [ ] Add schema.org validation tests
- [ ] Document SEO workflow in `docs/seo-workflow.md`
- [ ] Add admin UI notification after publish

### Future (On-demand)
- [ ] Evaluate dynamic LD-JSON if update frequency increases
- [ ] Set up Cloudflare KV for caching layer
- [ ] Create A/B test: static vs dynamic SEO performance
- [ ] Monitor Core Web Vitals impact

---

## References

### Code Locations
- Static data loader: [src/lib/data.ts](src/lib/data.ts)
- D1 repository: [src/lib/admin/content-repository.ts](src/lib/admin/content-repository.ts)
- Product page: [src/app/(site)/[locale]/products/[id]/page.tsx](src/app/(site)/[locale]/products/[id]/page.tsx)
- Layout LD-JSON: [src/app/(site)/[locale]/layout.tsx:125-161](src/app/(site)/[locale]/layout.tsx#L125-L161)

### External Resources
- [Next.js ISR Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [Cloudflare D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [OpenNext Cloudflare Adapter](https://opennext.js.org/cloudflare)
- [Schema.org Product Specification](https://schema.org/Product)
- [Google Search Central: Structured Data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)

---

## Conclusion

**Static LD-JSON remains the best approach** for this project due to:
- Stable product catalog (41 products)
- Optimal SEO performance (instant HTML)
- OpenNext SSG architecture
- Minimal update frequency

**ISR provides the sweet spot**:
- Static performance (0 DB queries)
- Hourly automatic updates
- No rebuild required for content changes

**Dynamic LD-JSON should only be considered** when:
- Update frequency > 5/day
- Real-time data critical
- Rebuild time becomes bottleneck

The recommended Phase 1 improvements provide **90% of dynamic benefits** with **10% of complexity**.
