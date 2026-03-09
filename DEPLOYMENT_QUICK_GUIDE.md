# 🚀 部署快速指南

## 🎯 選擇你的部署方式

### ⭐ 方式 A：GitHub Actions 自動部署（推薦）

**適合**：
- ✅ 團隊協作
- ✅ 自動化 CI/CD
- ✅ 推送即部署

**設定一次，永久使用**：
```bash
# 1. 設定 Cloudflare Secrets（一次性）
./scripts/set-cloudflare-secrets.sh

# 2. 設定 GitHub Secrets（一次性）
# 在 GitHub Settings → Secrets 添加：
# - CLOUDFLARE_API_TOKEN
# - CLOUDFLARE_ACCOUNT_ID

# 3. 之後每次推送自動部署
git push origin main  # 自動部署！✨
```

📖 **完整設定指南**：[GitHub Actions 部署文檔](docs/GITHUB_ACTIONS_DEPLOYMENT.md)

---

### 🔧 方式 B：手動本地部署

**適合**：
- ✅ 本地開發測試
- ✅ 快速部署更新
- ✅ 完全控制部署時機

---

## 問題：環境變數在每次部署後都會清空？

✅ **解決方案**：使用 Cloudflare Secrets 代替 Vars

---

## 📋 快速命令（手動部署）

### 首次部署或更新 Secrets

```bash
# 方法 1: 使用自動化腳本（推薦）
npm run deploy:safe

# 方法 2: 手動設定
npm run secrets:set
npm run deploy
```

### 一般程式碼更新（Secrets 未變）

```bash
npm run deploy
```

Secrets 會自動保留！✅

### 查看已設定的 Secrets

```bash
npm run secrets:list
```

### 單獨更新某個 Secret

```bash
wrangler secret put ADMIN_PASSWORD --name lihepreform02
```

---

## 🔐 需要設定的 Secrets

```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password
ADMIN_SESSION_SECRET=your_secret_key
RESEND_API_KEY=re_your_api_key
```

---

## 📖 詳細文檔

完整說明請參考：[docs/CLOUDFLARE_SECRETS_MANAGEMENT.md](docs/CLOUDFLARE_SECRETS_MANAGEMENT.md)

---

## ⚡ 常用指令

| 指令 | 說明 |
|------|------|
| `npm run deploy:safe` | 完整部署（含 secrets 設定） |
| `npm run deploy` | 快速部署（保留 secrets） |
| `npm run secrets:set` | 互動式設定 secrets |
| `npm run secrets:list` | 查看所有 secrets |
| `npm run cf:build` | 只建置，不部署 |
| `npm run preview` | 本地預覽 |

---

## 💡 記住

1. **敏感資訊用 Secrets**（密碼、API Keys）
2. **Secrets 不會在部署時清空**
3. **首次部署需設定 Secrets**
4. **後續只需 `npm run deploy`**

---

問題？查看 [CLOUDFLARE_SECRETS_MANAGEMENT.md](docs/CLOUDFLARE_SECRETS_MANAGEMENT.md)
