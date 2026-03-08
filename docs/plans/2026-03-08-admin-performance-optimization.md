# Admin Performance Optimization Plan
**Date**: 2026-03-08
**Priority**: High
**Status**: Planning

## Problem Statement
管理後台每個頁面載入時間達到 10 秒左右,嚴重影響使用體驗。

## Root Cause Analysis

### 1. **N+1 Schema Initialization Problem** (最嚴重)
每個頁面在每次 data loading function 都會執行 `ensureAdminSchema()`:

```typescript
// src/lib/admin/content-repository.ts
export async function listMedia(): Promise<MediaRecord[]> {
  await ensureAdminSchema();  // ← 每次都執行
  // ...
}

export async function listProducts(): Promise<ProductRecord[]> {
  await ensureAdminSchema();  // ← 每次都執行
  // ...
}
```

**`ensureAdminSchema()` 做了什麼:**
- 分割 SQL schema 成多個語句 (約 10+ 個 CREATE TABLE statements)
- **每個語句都發送一個 HTTP request 到 Cloudflare D1 API**
- 每個請求延遲約 200-500ms
- 總時間: 10 statements × 300ms = **3-5 秒**

**頁面級別的累積效應:**
- `/admin/media` → 1 次 `listMedia()` = 3-5s
- `/admin/products` → 1 次 `listProducts()` = 3-5s
- `/admin/products/[id]` → `listMedia()` + `getProductById()` (內部調用 `listProducts()`) = **6-10s**
- `/admin/factory` → `getFactoryContent(en)` + `getFactoryContent(ru)` + `getFactoryContent(es)` + `listMedia()` = **12-20s**

### 2. **HTTP-based D1 API Overhead**
目前使用 Cloudflare REST API 而非 Workers binding:

```typescript
// src/lib/admin/d1.ts:16-29
async function execute<T extends D1ResultRow>(sql: string, params: unknown[] = []) {
  const config = getD1Config();
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/d1/database/${config.databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
      cache: "no-store",
    },
  );
  // ...
}
```

**問題:**
- 每次查詢都需要完整的 HTTPS 握手
- 需要經過公開網路而非 Cloudflare 內網
- 無法使用 connection pooling
- 延遲: REST API ~200-500ms vs Workers binding ~10-50ms

### 3. **Multiple Sequential D1 Queries**
例如 `listProducts()`:

```typescript
// src/lib/admin/content-repository.ts:186-221
export async function listProducts(): Promise<ProductRecord[]> {
  await ensureAdminSchema();  // 10+ HTTP requests
  const productRows = await d1Query<ProductRow>("SELECT * FROM products...");  // +1 HTTP
  const translationRows = await d1Query<ProductTranslationRow>("SELECT * FROM product_translations");  // +1 HTTP
  const imageRows = await d1Query<ProductImageRow>("SELECT * FROM product_images...");  // +1 HTTP
  // ...
}
```

總共: **13+ HTTP requests** 用於單一頁面載入

### 4. **No Caching Strategy**
- 所有頁面都設定 `export const dynamic = "force-dynamic"`
- `cache: "no-store"` 在所有 D1 queries
- schema 初始化沒有任何 cache 或 flag check

---

## Optimization Strategy

### Phase 1: Schema Initialization Optimization (立即執行)
**Impact**: 減少 80-90% 的初始載入時間

#### Option A: Once-per-deployment Flag (推薦,最簡單)
```typescript
// src/lib/admin/schema-init.ts (new file)
let schemaInitialized = false;

export async function ensureAdminSchema() {
  if (schemaInitialized) return;

  const statements = ADMIN_SCHEMA_SQL.split(";\n\n")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await d1Exec(statement);
  }

  schemaInitialized = true;
}
```

**優點:**
- 零配置改動
- 立即生效
- 部署時 schema 只執行一次
- 降低 10 個頁面請求 → 1 個頁面請求

**缺點:**
- Worker restart 後會重新執行 (但 Cloudflare Workers 自動處理 idempotent CREATE TABLE IF NOT EXISTS)

#### Option B: D1 Metadata Table Check
```typescript
export async function ensureAdminSchema() {
  const check = await d1First<{ value: string }>(
    "SELECT value FROM _admin_meta WHERE key = 'schema_version'"
  );

  if (check?.value === CURRENT_SCHEMA_VERSION) return;

  // Run migrations
  for (const statement of statements) {
    await d1Exec(statement);
  }

  await d1Exec(
    "INSERT OR REPLACE INTO _admin_meta (key, value) VALUES ('schema_version', ?)",
    [CURRENT_SCHEMA_VERSION]
  );
}
```

**優點:**
- 支援 schema versioning
- 可以實現漸進式 migrations
- 跨 Worker instances 持久化

**缺點:**
- 需要額外的 metadata table
- 增加一次 D1 query (但比 10+ 次好很多)

---

### Phase 2: D1 Query Batching & Optimization
**Impact**: 減少 50-70% 的查詢時間

#### 2.1 Batch Parallel Queries
```typescript
// Before (sequential)
const productRows = await d1Query<ProductRow>("SELECT...");
const translationRows = await d1Query<ProductTranslationRow>("SELECT...");
const imageRows = await d1Query<ProductImageRow>("SELECT...");

// After (parallel)
const [productRows, translationRows, imageRows] = await Promise.all([
  d1Query<ProductRow>("SELECT..."),
  d1Query<ProductTranslationRow>("SELECT..."),
  d1Query<ProductImageRow>("SELECT..."),
]);
```

#### 2.2 Single JOIN Query (更優)
```typescript
// src/lib/admin/content-repository.ts
export async function listProducts(): Promise<ProductRecord[]> {
  const rows = await d1Query<CombinedProductRow>(`
    SELECT
      p.*,
      pt.locale, pt.name, pt.description, pt.seo_title, pt.seo_description,
      pi.media_id, pi.sort_order, pi.is_primary
    FROM products p
    LEFT JOIN product_translations pt ON p.id = pt.product_id
    LEFT JOIN product_images pi ON p.id = pi.product_id
    ORDER BY p.sort_order ASC, p.id DESC, pi.sort_order ASC
  `);

  // Group by product_id in memory
  return groupProductRows(rows);
}
```

**減少:** 3 HTTP requests → 1 HTTP request

---

### Phase 3: Consider Server-Side Caching (選擇性)
**Impact**: 減少 90%+ 重複查詢時間

#### Option A: Cloudflare KV Cache
```typescript
// src/lib/admin/cache.ts
export async function getCachedProducts(locale: string): Promise<ProductRecord[] | null> {
  const cached = await env.ADMIN_CACHE.get(`products:${locale}`, "json");
  return cached;
}

export async function setCachedProducts(locale: string, products: ProductRecord[]) {
  await env.ADMIN_CACHE.put(
    `products:${locale}`,
    JSON.stringify(products),
    { expirationTtl: 300 } // 5 分鐘
  );
}
```

#### Option B: In-Memory Cache with TTL
```typescript
const productCache = new Map<string, { data: ProductRecord[]; expires: number }>();

export async function listProducts(): Promise<ProductRecord[]> {
  const cached = productCache.get("all");
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }

  const products = await fetchProductsFromD1();
  productCache.set("all", { data: products, expires: Date.now() + 60000 });
  return products;
}
```

**注意:** 需要實現 cache invalidation 機制 (save/delete 時清除)

---

### Phase 4: Migrate to Workers D1 Binding (中長期)
**Impact**: 減少 70-80% 的網路延遲

目前架構可能使用 Next.js SSR + HTTP API,應該考慮:

#### Option A: 使用 Cloudflare Workers + Next.js on Workers
```typescript
// 在 Worker context 中直接使用 D1 binding
export async function d1Query<T>(sql: string, params: unknown[] = []) {
  const result = await env.CONTENT_DB.prepare(sql).bind(...params).all();
  return result.results as T[];
}
```

**優點:**
- 10-20x 更快的查詢速度
- 不需要 API token 管理
- 自動 connection pooling

#### Option B: API Route 優化
如果必須使用 HTTP API,考慮實現批次查詢端點:

```typescript
// app/api/admin/batch/route.ts
export async function POST(request: Request) {
  const { queries } = await request.json();

  // Execute all queries in single D1 batch
  const results = await Promise.all(
    queries.map(({ sql, params }) => d1Query(sql, params))
  );

  return Response.json({ results });
}
```

---

## Implementation Roadmap

### Week 1: Quick Wins (預期改善 80-90%)
- [ ] **Task 1.1**: Implement schema initialization flag ([content-repository.ts:97-103])
- [ ] **Task 1.2**: Add parallel queries in `listProducts()` ([content-repository.ts:186-222])
- [ ] **Task 1.3**: Add parallel queries in `listMedia()` ([content-repository.ts:105-127])
- [ ] **Task 1.4**: Test all admin pages load time
- [ ] **Task 1.5**: Commit changes

**Expected Results:**
- `/admin/media`: 10s → 1-2s
- `/admin/products`: 10s → 2-3s
- `/admin/products/[id]`: 10s → 2-4s

### Week 2: Query Optimization (預期改善 50-70%)
- [ ] **Task 2.1**: Refactor `listProducts()` to use JOIN query
- [ ] **Task 2.2**: Refactor `listMedia()` to use JOIN query
- [ ] **Task 2.3**: Add database indexes for common queries
- [ ] **Task 2.4**: Benchmark and compare
- [ ] **Task 2.5**: Commit optimized queries

**Expected Results:**
- Further reduce to sub-second load times for most pages

### Week 3-4: Advanced Optimization (選擇性)
- [ ] **Task 3.1**: Implement cache layer (KV or in-memory)
- [ ] **Task 3.2**: Add cache invalidation hooks
- [ ] **Task 3.3**: Evaluate Workers D1 binding migration
- [ ] **Task 3.4**: Document caching strategy

---

## Metrics & Monitoring

### Before Optimization (Baseline)
```
/admin/media:          ~10s
/admin/products:       ~10s
/admin/products/[id]:  ~10s
/admin/factory:        ~15-20s (multiple locale fetches)
```

### Target After Phase 1
```
/admin/media:          < 2s  (80% improvement)
/admin/products:       < 3s  (70% improvement)
/admin/products/[id]:  < 4s  (60% improvement)
/admin/factory:        < 5s  (75% improvement)
```

### Target After Phase 2
```
All pages:             < 1s  (90%+ improvement)
```

---

## Risk Assessment

### Low Risk
- ✅ Schema initialization flag (idempotent SQL)
- ✅ Parallel queries (no logic change)

### Medium Risk
- ⚠️ JOIN query refactoring (需要仔細測試 data grouping logic)
- ⚠️ Caching implementation (需要 invalidation strategy)

### High Risk
- 🔴 Workers D1 binding migration (需要重寫整個 data layer)

---

## Next Steps
1. Review this plan
2. Approve Phase 1 implementation
3. Create feature branch for optimization work
4. Implement Task 1.1 - 1.5
5. Deploy to staging and test
6. Monitor production metrics
