# 🚀 GitHub Actions 自動部署快速設定

## 📋 四步驟設定（僅需做一次）

### ✅ Step 1: 設定 Cloudflare Secrets

```bash
# 執行腳本，自動從 .env 讀取並上傳所有變數到 Cloudflare
./scripts/set-cloudflare-secrets.sh lihepreform02
```

**這會設定：**
- ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_SESSION_SECRET
- RESEND_API_KEY
- CLOUDFLARE_D1_DATABASE_ID
- CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, CLOUDFLARE_R2_BUCKET
- GEMINI_API_KEY
- 其他運行時需要的變數

**重要：這些 secrets 會永久儲存在 Cloudflare，之後所有部署都會保留它們！**

---

### ✅ Step 2: 關閉 Cloudflare 自動部署

1. 前往 https://dash.cloudflare.com/
2. 左側選單 → **Workers & Pages**
3. 找到 `lihepreform02` 專案
4. **Settings** → **Builds & deployments**
5. 如果看到 "Connected to GitHub" 或 "Automatic deployments"，請停用或刪除

**目的：避免與 GitHub Actions 衝突**

---

### ✅ Step 3: 設定 GitHub Secrets

#### 3.1 取得 Cloudflare API Token

1. 前往 https://dash.cloudflare.com/profile/api-tokens
2. 點擊 **Create Token**
3. 選擇 **Edit Cloudflare Workers** 範本
4. **Account Resources** → Include → 選擇你的帳號
5. **Zone Resources** → Include → All zones（或選擇特定 zone）
6. 點擊 **Continue to summary** → **Create Token**
7. **複製 Token**（只會顯示一次！）

#### 3.2 在 GitHub 新增 Secrets

1. 前往 GitHub Repository: https://github.com/lovemage/lihe_preform
2. **Settings** → **Secrets and variables** → **Actions**
3. 點擊 **New repository secret**

**新增第一個：**
```
Name: CLOUDFLARE_API_TOKEN
Value: [貼上剛才複製的 Token]
```

**新增第二個：**
```
Name: CLOUDFLARE_ACCOUNT_ID
Value: 3bda351a70f73e25c5e5589189ff87e8
```

---

### ✅ Step 4: 測試自動部署

```bash
# 推送程式碼觸發 GitHub Actions
git add .
git commit -m "test: GitHub Actions auto-deployment"
git push origin main
```

#### 驗證部署：

1. 前往 GitHub Repository → **Actions** 標籤
2. 查看最新的 workflow 執行狀態
3. 等待綠色勾勾 ✅（約 2-3 分鐘）
4. 訪問你的網站確認更新

---

## 🎯 之後的使用

設定完成後，每次只需：

```bash
git add .
git commit -m "feat: 新功能"
git push origin main
```

**自動執行：**
- ✅ 版本號自動增加（pre-push hook）
- ✅ GitHub Actions 自動建置
- ✅ 自動部署到 Cloudflare Workers
- ✅ Cloudflare Secrets 保持不變

---

## 🔍 檢查 Secrets 狀態

### 查看 Cloudflare Secrets（已設定的）

```bash
npx wrangler secret list --name lihepreform02
```

**預期輸出：**
```
ADMIN_USERNAME
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
RESEND_API_KEY
CLOUDFLARE_D1_DATABASE_ID
... 等等
```

### 查看 GitHub Secrets

1. GitHub Repository → Settings → Secrets and variables → Actions
2. 應該看到：
   - CLOUDFLARE_API_TOKEN
   - CLOUDFLARE_ACCOUNT_ID

---

## ⚠️ 常見問題

### Q: 部署後 Secrets 會被清空嗎？

**A: 不會！** Cloudflare Secrets 是伺服器端加密儲存，`wrangler deploy` 只更新程式碼，不會碰 Secrets。

### Q: 需要每次部署都設定環境變數嗎？

**A: 不需要！** 第一次設定後，Secrets 永久保留，除非你手動更新。

### Q: GitHub Actions 失敗怎麼辦？

**A: 檢查：**
1. GitHub Secrets 是否正確設定（`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`）
2. API Token 是否有正確的權限（Edit Cloudflare Workers）
3. 查看 Actions 標籤的錯誤訊息

---

## 📚 詳細文檔

需要更詳細的說明？請參考：

- [GitHub Actions 部署完整指南](docs/GITHUB_ACTIONS_DEPLOYMENT.md)
- [Cloudflare Secrets 管理](docs/CLOUDFLARE_SECRETS_MANAGEMENT.md)
- [部署快速參考](DEPLOYMENT_QUICK_GUIDE.md)

---

**完成後你將擁有：**
- ✅ 全自動 CI/CD 部署流程
- ✅ 環境變數永久保留不丟失
- ✅ 版本號自動管理
- ✅ 完整的部署歷史記錄

🎉 **就是這麼簡單！**
