# 🚀 部署快速指南

## 問題：環境變數在每次部署後都會清空？

✅ **解決方案**：使用 Cloudflare Secrets 代替 Vars

---

## 📋 快速命令

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
