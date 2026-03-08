# Cloudflare Workers 環境變數管理指南

## 問題說明

使用 `opennextjs-cloudflare deploy` 時，每次部署會重新生成 `wrangler.toml`，導致環境變數（vars）被清空。

## 解決方案

Cloudflare Workers 提供兩種方式管理環境變數：

### 1. **Vars** (普通環境變數)
- 儲存在 `wrangler.toml` 中
- **會在每次部署時被覆蓋** ❌
- 適合非敏感資訊

### 2. **Secrets** (加密環境變數) ✅ 推薦
- 儲存在 Cloudflare 伺服器端
- **不會在部署時被清空** ✅
- 透過 `wrangler secret` 命令管理
- 適合敏感資訊（密碼、API Keys）

---

## 🔐 使用 Secrets（推薦方式）

### 方法一：使用自動化腳本

我們已經準備好兩個腳本：

#### 1. 完整部署（建置 + 設定 Secrets + 部署）

```bash
./scripts/deploy-with-secrets.sh
```

這個腳本會：
1. 建置應用程式 (`npm run cf:build`)
2. 從 `.dev.vars` 讀取並設定所有 secrets
3. 部署到 Cloudflare

#### 2. 只設定 Secrets（不部署）

```bash
./scripts/set-cloudflare-secrets.sh
```

這個腳本會互動式地詢問你要設定的 secrets。

### 方法二：手動設定 Secrets

#### 一次設定一個 secret

```bash
# 基本語法
wrangler secret put VARIABLE_NAME --name lihepreform02

# 範例：設定管理員密碼
wrangler secret put ADMIN_PASSWORD --name lihepreform02
# 然後輸入密碼並按 Enter

# 設定 Resend API Key
wrangler secret put RESEND_API_KEY --name lihepreform02
```

#### 使用管道傳入值（適合自動化）

```bash
echo "your_password_here" | wrangler secret put ADMIN_PASSWORD --name lihepreform02
```

#### 查看所有已設定的 secrets

```bash
wrangler secret list --name lihepreform02
```

輸出範例：
```
[
  {
    "name": "ADMIN_USERNAME",
    "type": "secret_text"
  },
  {
    "name": "ADMIN_PASSWORD",
    "type": "secret_text"
  },
  {
    "name": "RESEND_API_KEY",
    "type": "secret_text"
  }
]
```

#### 刪除 secret

```bash
wrangler secret delete VARIABLE_NAME --name lihepreform02
```

---

## 📝 需要設定的 Secrets

### 必要的 Secrets

```bash
# 管理員認證
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
ADMIN_SESSION_SECRET=your_random_secret_key

# Email 服務（當 Resend 整合後）
RESEND_API_KEY=re_your_api_key
```

### 設定步驟

1. **準備 `.dev.vars` 檔案**

   我們已經創建了 `.dev.vars` 範本，編輯它：
   ```bash
   nano .dev.vars
   ```

   填入你的值：
   ```
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=zac123456
   ADMIN_SESSION_SECRET=2yxclenyXDMwqqURL3231zac
   RESEND_API_KEY=
   ```

2. **運行設定腳本**

   ```bash
   ./scripts/set-cloudflare-secrets.sh
   ```

   或使用完整部署腳本：
   ```bash
   ./scripts/deploy-with-secrets.sh
   ```

3. **驗證設定**

   ```bash
   wrangler secret list --name lihepreform02
   ```

---

## 🔄 日常部署流程

### 情境一：首次部署或 Secrets 改變

```bash
# 使用自動化腳本（建議）
./scripts/deploy-with-secrets.sh

# 或手動步驟
npm run cf:build
./scripts/set-cloudflare-secrets.sh
npx opennextjs-cloudflare deploy
```

### 情境二：一般程式碼更新（Secrets 未改變）

```bash
# 直接部署即可，secrets 會保留
npm run deploy
```

Secrets 不會被清空！✅

### 情境三：只更新某個 Secret

```bash
# 不需要重新部署，直接更新
wrangler secret put ADMIN_PASSWORD --name lihepreform02
```

更新會立即生效，無需重新部署。

---

## 🏗️ Worker 名稱管理

你的 Worker 名稱是 `lihepreform02`。

### 查看 Worker 名稱

```bash
wrangler whoami
wrangler deployments list
```

### 如果 Worker 名稱不同

腳本支援自訂 Worker 名稱：

```bash
./scripts/deploy-with-secrets.sh your-worker-name
./scripts/set-cloudflare-secrets.sh your-worker-name
```

---

## 🧪 本地開發

### 使用 `.dev.vars` 檔案

Wrangler 在本地開發時會自動讀取 `.dev.vars`：

```bash
wrangler dev
# 或
npm run dev
```

**注意**：
- `.dev.vars` 僅用於本地開發
- 生產環境使用 Secrets
- `.dev.vars` 已加入 `.gitignore`，不會提交到 Git

---

## 🔍 除錯

### 檢查 Secret 是否生效

在你的 Worker 程式碼中：

```typescript
export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { env } = await getCloudflareContext();

  // 檢查環境變數
  console.log('ADMIN_USERNAME exists:', !!env.ADMIN_USERNAME);
  console.log('RESEND_API_KEY exists:', !!env.RESEND_API_KEY);

  // 不要記錄實際的值！
}
```

### 常見問題

#### Q: Secret 設定後沒有生效？

A:
1. 檢查 Worker 名稱是否正確
2. 重新部署一次（某些情況需要）
3. 查看 Cloudflare Dashboard 確認

#### Q: 如何查看 Secret 的值？

A: **無法查看**。Secrets 是加密儲存的，只能刪除後重新設定。

#### Q: `.dev.vars` vs `.env` 的差異？

A:
- `.dev.vars` - Wrangler 本地開發使用
- `.env` - Next.js 本地開發使用
- 兩者可以共存

#### Q: 部署後 Admin 登入失敗？

A: 確認 secrets 已設定：
```bash
wrangler secret list --name lihepreform02
```

如果沒有 `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`，重新設定：
```bash
./scripts/set-cloudflare-secrets.sh
```

---

## 📊 Secrets vs Vars 比較

| 特性 | Vars (wrangler.toml) | Secrets (wrangler secret) |
|------|---------------------|---------------------------|
| 儲存位置 | wrangler.toml 檔案 | Cloudflare 伺服器端 |
| 安全性 | 明文儲存 ⚠️ | 加密儲存 ✅ |
| Git 提交 | 會被提交 | 不會被提交 |
| 部署後保留 | ❌ 會被覆蓋 | ✅ 永久保留 |
| 適合用途 | 公開設定 | 敏感資訊 |
| 查看方式 | 可在檔案中查看 | 無法查看 |
| 更新方式 | 編輯 wrangler.toml | wrangler secret put |

**建議**：所有敏感資訊都使用 Secrets！

---

## 🎯 最佳實踐

1. **永遠使用 Secrets 儲存敏感資訊**
   - 密碼
   - API Keys
   - Session Secrets
   - Database 連線字串

2. **使用 `.dev.vars` 進行本地開發**
   - 保持與生產環境一致的變數名稱
   - 不要提交到 Git

3. **定期更新 Secrets**
   - 定期更換密碼和 API Keys
   - 使用強密碼

4. **文檔化你的環境變數**
   - 維護一份環境變數清單
   - 註明每個變數的用途

5. **使用自動化腳本**
   - 減少人為錯誤
   - 保持部署流程一致

---

## 🚀 快速參考

```bash
# 查看所有 secrets
wrangler secret list --name lihepreform02

# 設定單個 secret
wrangler secret put VARIABLE_NAME --name lihepreform02

# 刪除 secret
wrangler secret delete VARIABLE_NAME --name lihepreform02

# 使用腳本設定所有 secrets
./scripts/set-cloudflare-secrets.sh

# 完整部署（含 secrets）
./scripts/deploy-with-secrets.sh

# 一般部署（secrets 會保留）
npm run deploy
```

---

## 📞 支援

如有問題：
1. 查看 Cloudflare Workers 文檔：https://developers.cloudflare.com/workers/configuration/secrets/
2. 檢查 wrangler CLI 文檔：https://developers.cloudflare.com/workers/wrangler/commands/#secret
3. 聯絡技術團隊

---

## 版本記錄

- **v1.0** (2026-03-08): 初始版本
  - 創建自動化部署腳本
  - 創建 secrets 設定腳本
  - 完整文檔說明
