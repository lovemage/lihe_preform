# GitHub Actions 自動部署指南

## 概述

設定完成後，每次推送到 `main` 分支，GitHub Actions 會自動：
1. ✅ 建置應用程式
2. ✅ 部署到 Cloudflare Workers
3. ✅ **保留所有 Cloudflare Secrets**（不會被覆蓋！）

---

## 🔐 重要觀念

### Secrets 的三個層級

| 層級 | 儲存位置 | 用途 | 會被覆蓋？ |
|------|---------|------|-----------|
| **GitHub Secrets** | GitHub Repository Settings | CI/CD 部署用（API Token） | ❌ 不會 |
| **Cloudflare Secrets** | Cloudflare Workers | 應用程式運行時使用 | ❌ 不會 |
| **本地 .dev.vars** | 本地開發機器 | 本地開發用 | N/A |

**關鍵點**：
- GitHub Actions 只需要 **部署權限** (API Token)
- 應用程式的敏感資料 (密碼、API Keys) 儲存在 **Cloudflare Secrets**
- Cloudflare Secrets **永遠不會被部署覆蓋** ✅

---

## 📋 設定步驟

### 步驟 1️⃣：設定 Cloudflare Secrets（一次性）

這些是你的應用程式運行時需要的環境變數，**只需設定一次**。

#### 使用自動化腳本（推薦）

```bash
# 確保 .dev.vars 已填寫正確的值
cat .dev.vars

# 執行設定腳本
./scripts/set-cloudflare-secrets.sh lihepreform02
```

#### 或手動設定每個 Secret

```bash
# Admin 認證
echo "admin" | wrangler secret put ADMIN_USERNAME --name lihepreform02
echo "zac123456" | wrangler secret put ADMIN_PASSWORD --name lihepreform02
echo "2yxclenyXDMwqqURL3231zac" | wrangler secret put ADMIN_SESSION_SECRET --name lihepreform02

# Resend API（當整合後）
echo "re_your_api_key" | wrangler secret put RESEND_API_KEY --name lihepreform02
```

#### 驗證設定

```bash
wrangler secret list --name lihepreform02
```

應該看到：
```json
[
  { "name": "ADMIN_USERNAME", "type": "secret_text" },
  { "name": "ADMIN_PASSWORD", "type": "secret_text" },
  { "name": "ADMIN_SESSION_SECRET", "type": "secret_text" },
  { "name": "RESEND_API_KEY", "type": "secret_text" }
]
```

✅ **這些 Secrets 在未來的部署中會自動保留！**

---

### 步驟 2️⃣：取得 Cloudflare API Token

#### 2.1 登入 Cloudflare Dashboard

訪問：https://dash.cloudflare.com/

#### 2.2 創建 API Token

1. 點擊右上角頭像 → **"My Profile"**
2. 左側菜單選擇 **"API Tokens"**
3. 點擊 **"Create Token"**

#### 2.3 設定 Token 權限

使用 **"Edit Cloudflare Workers"** 範本，或自訂權限：

```
Account Resources:
  - Account Settings: Read
  - Workers Scripts: Edit
  - Workers KV Storage: Edit (如果使用)
  - Workers R2 Storage: Edit

Zone Resources:
  - Zone: Read
  - Workers Routes: Edit
```

#### 2.4 保存 Token

**重要**：Token 只會顯示一次！立即複製保存。

範例格式：
```
your-cloudflare-api-token-here-xxxxxxxxxxxxxxxxxxxxx
```

---

### 步驟 3️⃣：設定 GitHub Secrets

#### 3.1 前往 GitHub Repository Settings

1. 打開你的 GitHub Repository
2. 點擊 **Settings** 標籤
3. 左側菜單選擇 **Secrets and variables** → **Actions**

#### 3.2 添加 Secrets

點擊 **"New repository secret"** 並添加以下兩個：

##### Secret 1: CLOUDFLARE_API_TOKEN

```
Name: CLOUDFLARE_API_TOKEN
Value: 你在步驟 2.4 複製的 Token
```

##### Secret 2: CLOUDFLARE_ACCOUNT_ID

```
Name: CLOUDFLARE_ACCOUNT_ID
Value: 3bda351a70f73e25c5e5589189ff87e8
```

（你的 Account ID 可以在 Cloudflare Dashboard 右側找到）

#### 3.3 驗證

應該看到兩個 secrets：
- ✅ `CLOUDFLARE_API_TOKEN`
- ✅ `CLOUDFLARE_ACCOUNT_ID`

---

### 步驟 4️⃣：推送到 GitHub

現在可以推送程式碼，GitHub Actions 會自動部署！

```bash
# 確認 GitHub Actions workflow 已提交
git add .github/workflows/deploy.yml
git add -A
git commit -m "chore: add GitHub Actions auto-deployment"
git push origin main
```

---

## 🚀 部署流程

### 自動部署（推送時）

```bash
# 1. 修改程式碼
vim src/app/admin/home/page.tsx

# 2. 提交更改
git add .
git commit -m "feat: update home page"

# 3. 推送到 GitHub
git push origin main

# 4. GitHub Actions 自動觸發部署 ✅
# 5. Cloudflare Secrets 自動保留 ✅
```

### 查看部署狀態

1. 前往 GitHub Repository
2. 點擊 **"Actions"** 標籤
3. 查看最新的 workflow run

### 手動觸發部署

1. 進入 **Actions** 標籤
2. 選擇 **"Deploy to Cloudflare Workers"** workflow
3. 點擊 **"Run workflow"** → **"Run workflow"**

---

## 🔍 工作流程說明

### GitHub Actions Workflow

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) 做了什麼：

```yaml
1. ✅ Checkout 程式碼
2. ✅ 安裝 Node.js 20
3. ✅ 安裝依賴 (npm ci)
4. ✅ 建置應用程式 (npm run cf:build)
5. ✅ 部署到 Cloudflare Workers
6. ✅ 完成！
```

**重點**：
- ❌ **不會**覆蓋 Cloudflare Secrets
- ❌ **不會**修改環境變數
- ✅ **只會**更新程式碼

---

## 📊 環境變數管理流程圖

```
┌─────────────────────────────────────────────────────────┐
│                     本地開發                              │
│  .dev.vars (本地) → wrangler dev                         │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│              首次設定 Cloudflare Secrets                  │
│  ./scripts/set-cloudflare-secrets.sh                    │
│  → 設定 ADMIN_PASSWORD, RESEND_API_KEY 等                │
│  → 儲存在 Cloudflare (永久保留)                          │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│              設定 GitHub Secrets                          │
│  GitHub Settings → Secrets                               │
│  → CLOUDFLARE_API_TOKEN (部署權限)                       │
│  → CLOUDFLARE_ACCOUNT_ID                                 │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│              日常開發 & 部署                              │
│  git push origin main                                    │
│  → GitHub Actions 自動部署                               │
│  → Cloudflare Secrets 保持不變 ✅                        │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ 檢查清單

在第一次自動部署前，確認：

- [ ] Cloudflare Secrets 已設定
  ```bash
  wrangler secret list --name lihepreform02
  ```

- [ ] GitHub Secrets 已添加
  - CLOUDFLARE_API_TOKEN
  - CLOUDFLARE_ACCOUNT_ID

- [ ] Workflow 檔案已提交
  ```bash
  git add .github/workflows/deploy.yml
  git push origin main
  ```

- [ ] 測試部署成功
  - 查看 GitHub Actions 執行結果
  - 訪問 Worker URL 確認運作

- [ ] 驗證 Admin 登入
  - 訪問 `/admin/login`
  - 使用密碼登入（應該成功）

---

## 🔧 疑難排解

### Q: 部署後無法登入 Admin？

**原因**：Cloudflare Secrets 可能未設定。

**解決方案**：
```bash
# 檢查 secrets
wrangler secret list --name lihepreform02

# 如果沒有，重新設定
./scripts/set-cloudflare-secrets.sh lihepreform02
```

### Q: GitHub Actions 失敗？

**檢查事項**：
1. GitHub Secrets 是否正確設定
2. CLOUDFLARE_API_TOKEN 是否有效
3. Worker 名稱是否正確 (`lihepreform02`)

**查看錯誤**：
1. 前往 GitHub → Actions
2. 點擊失敗的 workflow
3. 查看錯誤訊息

### Q: 如何更新 Cloudflare Secret？

```bash
# 更新單個 secret（立即生效，無需重新部署）
echo "new_password" | wrangler secret put ADMIN_PASSWORD --name lihepreform02
```

### Q: 如何在本地測試？

```bash
# 本地開發（使用 .dev.vars）
npm run dev

# 本地預覽生產版本
npm run preview
```

---

## 🔄 更新環境變數的時機

### 需要更新 Cloudflare Secret 時：

```bash
# 例如：更換 Admin 密碼
echo "new_password_here" | wrangler secret put ADMIN_PASSWORD --name lihepreform02

# 更新後立即生效，無需重新部署
```

### 需要更新 GitHub Secret 時：

只有在以下情況需要：
- Cloudflare API Token 過期或更換
- Cloudflare Account ID 改變（極少發生）

更新方式：
1. GitHub Settings → Secrets → Actions
2. 點擊要更新的 secret
3. 輸入新值並保存

---

## 📈 最佳實踐

### 1. 安全性

- ✅ 永遠不要在程式碼中寫入密碼或 API Keys
- ✅ 使用 Cloudflare Secrets 儲存敏感資訊
- ✅ 定期更換密碼和 API Tokens
- ✅ 限制 API Token 的權限範圍

### 2. 部署流程

```bash
# 開發 → 測試 → 提交 → 推送 → 自動部署
npm run dev              # 本地開發
npm run preview          # 本地測試
git add .
git commit -m "feat: xxx"
git push origin main     # 自動部署
```

### 3. 版本管理

```bash
# 每次推送會自動增加版本號（pre-push hook）
git push origin main
# → 0.7.1 → 0.7.2 自動
```

### 4. 監控

- 查看 GitHub Actions 執行歷史
- 監控 Cloudflare Workers 分析
- 設定錯誤警報（可選）

---

## 🎯 常用命令速查

```bash
# 查看 Cloudflare Secrets
wrangler secret list --name lihepreform02

# 設定/更新單個 Secret
wrangler secret put VARIABLE_NAME --name lihepreform02

# 刪除 Secret
wrangler secret delete VARIABLE_NAME --name lihepreform02

# 本地開發
npm run dev

# 本地預覽
npm run preview

# 手動部署（如果需要）
npm run deploy

# 查看部署歷史
wrangler deployments list --name lihepreform02
```

---

## 📞 支援

遇到問題？

1. 查看 [CLOUDFLARE_SECRETS_MANAGEMENT.md](CLOUDFLARE_SECRETS_MANAGEMENT.md)
2. 查看 [DEPLOYMENT_QUICK_GUIDE.md](../DEPLOYMENT_QUICK_GUIDE.md)
3. 查看 GitHub Actions logs
4. 查看 Cloudflare Workers logs

---

## 版本記錄

- **v1.0** (2026-03-08): 初始版本
  - GitHub Actions 自動部署
  - Cloudflare Secrets 保護機制
  - 完整文檔和最佳實踐
