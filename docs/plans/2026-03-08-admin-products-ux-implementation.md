# Admin Products UX Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 改善 admin 後台產品管理體驗，完成繁體中文介面、左側導航，以及 products 頁內圖片上傳與產品圖片預覽。

**Architecture:** 延續既有 Next.js App Router admin 架構，保留既有 `/api/admin/media/upload` 與 products CRUD API，不新增新的資料模型。前端以 `AdminShell` 重構版型，並在 `ProductEditor` 內整合圖片上傳、縮圖設定與圖庫預覽，讓產品編輯操作集中在單頁完成。

**Tech Stack:** Next.js 16、React 19、TypeScript、既有 admin API routes、Cloudflare R2、Cloudflare D1

---

### Task 1: 重構 AdminShell 為左側導航並繁中化

**Files:**
- Modify: `src/components/admin/AdminShell/AdminShell.tsx`
- Verify: `src/app/admin/page.tsx`
- Verify: `src/app/admin/home/page.tsx`
- Verify: `src/app/admin/products/page.tsx`
- Verify: `src/app/admin/media/page.tsx`

**Step 1: 寫出版型目標**

- 左側固定側欄
- 右側主內容區
- 側欄導覽文案為繁體中文
- 保留既有 admin 連結結構

**Step 2: 最小化修改 `AdminShell`**

- 將頂部導覽改成左側側欄
- 顯示品牌名稱與導覽連結
- 主內容區顯示 `title` 與 `description`

**Step 3: 將 admin 常見頁面文案改為繁體中文**

- `Dashboard` → `儀表板`
- `Home` → `首頁內容`
- `Products` → `產品管理`
- `Media` → `媒體庫`

**Step 4: 本地驗證版型**

Run: `npm run dev`
Expected: `/admin`、`/admin/products`、`/admin/media` 顯示左側側欄與繁中文案

**Step 5: Commit**

```bash
git add src/components/admin/AdminShell/AdminShell.tsx src/app/admin/page.tsx src/app/admin/home/page.tsx src/app/admin/products/page.tsx src/app/admin/media/page.tsx
git commit -m "feat: redesign admin shell with zh-tw sidebar"
```

### Task 2: 將 products 列表頁與產品編輯頁文案繁中化

**Files:**
- Modify: `src/app/admin/products/page.tsx`
- Modify: `src/app/admin/products/[id]/page.tsx`
- Modify: `src/components/admin/ProductTable/ProductTable.tsx`

**Step 1: 明確列出需翻譯文案**

- 頁面標題
- 頁面描述
- 表格欄位名稱
- 新增產品按鈕
- 編輯入口文字

**Step 2: 修改 products 列表與 detail 頁文案**

- 以繁體中文取代英文 UI 字串
- 保留資料欄位值原樣，不翻資料內容

**Step 3: 驗證列表與明細頁**

Run: `npm run dev`
Expected: `/admin/products` 與 `/admin/products/[id]` 為繁體中文介面

**Step 4: Commit**

```bash
git add src/app/admin/products/page.tsx src/app/admin/products/[id]/page.tsx src/components/admin/ProductTable/ProductTable.tsx
git commit -m "feat: localize admin products ui to zh-tw"
```

### Task 3: 在 ProductEditor 加入頁內圖片上傳按鈕

**Files:**
- Modify: `src/components/admin/ProductEditor/ProductEditor.tsx`
- Verify: `src/app/api/admin/media/upload/route.ts`
- Verify: `src/types/admin.ts`

**Step 1: 定義上傳互動**

- 新增檔案選擇 input
- 新增 `上傳圖片` 按鈕
- 新增上傳 loading / error / success 狀態

**Step 2: 串接既有 media upload API**

- 使用 `FormData`
- 呼叫 `/api/admin/media/upload`
- 上傳成功後取得 `media` 記錄

**Step 3: 將新圖片立即加入產品圖庫**

- 自動加入 `state.gallery`
- 若尚無縮圖，將首張新圖設為 `thumbnailMediaId`
- 同步更新可用媒體清單顯示

**Step 4: 驗證上傳流程**

Run: `npm run dev`
Expected: 在產品編輯頁可上傳圖片，成功後立即看到圖庫有新增圖片

**Step 5: Commit**

```bash
git add src/components/admin/ProductEditor/ProductEditor.tsx
git commit -m "feat: add inline product image upload"
```

### Task 4: 在 ProductEditor 顯示縮圖與圖庫預覽

**Files:**
- Modify: `src/components/admin/ProductEditor/ProductEditor.tsx`

**Step 1: 建立媒體對照資料**

- 使用 `media` 建立 `mediaId -> media record` map
- 供縮圖與圖庫顯示使用

**Step 2: 新增圖片預覽區塊**

- 顯示目前縮圖
- 顯示目前產品圖庫
- 每張圖顯示預覽、檔名、media id

**Step 3: 新增互動**

- `設為縮圖`
- `移除圖片`
- 保持 `gallery.sortOrder` 正確

**Step 4: 驗證儲存與重整**

Run: `npm run dev`
Expected: 設定縮圖、移除圖片、儲存後重新整理仍保持正確

**Step 5: Commit**

```bash
git add src/components/admin/ProductEditor/ProductEditor.tsx
git commit -m "feat: add product image previews and thumbnail actions"
```

### Task 5: 驗證整體 admin products UX

**Files:**
- Verify: `src/components/admin/AdminShell/AdminShell.tsx`
- Verify: `src/components/admin/ProductEditor/ProductEditor.tsx`
- Verify: `src/components/admin/ProductTable/ProductTable.tsx`
- Verify: `src/app/admin/page.tsx`
- Verify: `src/app/admin/products/page.tsx`
- Verify: `src/app/admin/products/[id]/page.tsx`

**Step 1: 執行 build 驗證**

Run: `npm run build`
Expected: PASS

**Step 2: 手動 smoke test**

- 打開 `/admin`
- 打開 `/admin/products`
- 進入任一產品編輯頁
- 上傳圖片
- 設為縮圖
- 儲存並重新整理

**Step 3: 確認不影響既有 admin 頁面**

- `/admin/home`
- `/admin/media`

**Step 4: Commit**

```bash
git add src/components/admin/AdminShell/AdminShell.tsx src/components/admin/ProductEditor/ProductEditor.tsx src/components/admin/ProductTable/ProductTable.tsx src/app/admin/page.tsx src/app/admin/products/page.tsx src/app/admin/products/[id]/page.tsx
git commit -m "feat: improve admin products ux"
```
