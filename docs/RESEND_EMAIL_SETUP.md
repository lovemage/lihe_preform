# Resend Email 管理系統使用指南

## 概述

Lihe Precision 網站現在包含完整的 Email 管理系統，支援：
1. **Email 模板管理** - 管理自動回覆郵件模板（三種語言）
2. **發送官方郵件** - 使用 sales@lihe-preform.com 發送專業郵件

## 功能一：Email 模板管理

### 訪問路徑
```
/admin/email-templates
```

### 功能說明

管理聯絡表單的自動回覆郵件模板，支援三種語言（英文、俄文、西班牙文）。

### 預設模板

系統包含兩個預設模板：

#### 1. Customer Thank You Email（客戶感謝信）
- **用途**: 當客戶提交聯絡表單後自動發送
- **語言**: EN / RU / ES
- **可用變數**:
  - `{{firstName}}` - 客戶名字
  - `{{familyName}}` - 客戶姓氏
  - `{{email}}` - Email 地址
  - `{{phone}}` - 電話號碼
  - `{{country}}` - 國家
  - `{{productCategory}}` - 產品類別
  - `{{requirements}}` - 需求內容

#### 2. Admin Notification Email（管理員通知）
- **用途**: 當有新的聯絡表單提交時通知管理員
- **收件人**: sales@lihe-preform.com
- **可用變數**: 同上，另外包含：
  - `{{timestamp}}` - 提交時間
  - `{{locale}}` - 語言代碼

### 使用方式

1. **選擇模板**
   - 從左側列表點選要編輯的模板
   - 系統顯示模板名稱和類型

2. **選擇語言**
   - 點選 English / Русский / Español 切換語言
   - 每個語言有獨立的主旨和內容

3. **編輯主旨**
   - 在 "Subject" 欄位輸入郵件主旨
   - 支援使用變數（如 `{{firstName}}`）

4. **編輯郵件內容**
   - 在 "Email Body (HTML)" 文字框編輯 HTML 內容
   - 支援完整的 HTML 格式
   - 使用變數會在發送時自動替換為實際內容

5. **儲存模板**
   - 點擊 "儲存模板" 按鈕
   - 系統會將所有語言的更新一併儲存

### 變數使用範例

```html
<p>Dear {{firstName}} {{familyName}},</p>
<p>Thank you for your inquiry about <strong>{{productCategory}}</strong>.</p>
<p>We have received your message from {{country}}.</p>
```

發送時會自動替換為：
```html
<p>Dear John Smith,</p>
<p>Thank you for your inquiry about <strong>PET Preform Mold</strong>.</p>
<p>We have received your message from United States.</p>
```

### HTML 樣式建議

模板已包含基礎樣式：
```html
<style>
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background: #2c5aa0; color: white; padding: 20px; text-align: center; }
  .content { padding: 20px; background: #f9f9f9; }
  .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
</style>
```

建議保持：
- 最大寬度 600px（適合大部分郵件客戶端）
- 使用內聯樣式或 `<style>` 標籤
- 避免使用外部 CSS
- 使用安全的字型（Arial, sans-serif）

---

## 功能二：發送官方郵件

### 訪問路徑
```
/admin/send-email
```

### 功能說明

使用 sales@lihe-preform.com 發送專業郵件給客戶，支援自訂簽名檔。

### 主要功能

#### 1. 基本郵件欄位

**收件人 Email**
- 必填欄位
- 支援標準 Email 格式驗證
- 範例：`customer@example.com`

**主旨**
- 必填欄位
- 郵件主題
- 範例：`Quotation for PET Preform Mold - 48 Cavity`

**郵件內容**
- 必填欄位
- 支援多行文字
- 可使用快速插入模板

#### 2. 快速插入模板

系統提供四種常用模板可快速插入：

**問候語**
```
Dear Customer,

Thank you for your interest in Lihe Precision.
```

**報價**
```
Thank you for your inquiry about our PET preform mold solutions.

Based on your requirements, we would like to propose the following:
```

**跟進**
```
I hope this email finds you well.

I wanted to follow up on our previous conversation regarding...
```

**會議後續**
```
Thank you for taking the time to meet with us.

As discussed, we would like to move forward with...
```

點擊按鈕會將模板內容插入到郵件內容中，您可以繼續編輯。

#### 3. 簽名檔功能

**自動附加簽名檔**
- 勾選「自動附加簽名檔」可在郵件末尾加上專業簽名
- 預覽區域會即時顯示簽名檔樣式

**簽名檔包含資訊**：
- 姓名
- 職稱
- 公司名稱
- Email
- 電話
- 網站

**簽名檔設定**（右側欄位）：
1. 填寫所有簽名檔欄位
2. 點擊 "💾 儲存簽名檔"
3. 簽名檔會儲存在瀏覽器本地
4. 下次使用時會自動載入

**預設簽名檔**：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lihe Precision Sales Team
Sales Department
Foshan Lihe Precision Machinery Co., Ltd.

📧 sales@lihe-preform.com
📞 +86 757 8555 1234
🌐 www.lihe-preform.com
```

### 使用流程

1. **填寫收件人**
   - 輸入客戶 Email 地址

2. **撰寫主旨**
   - 輸入郵件主題

3. **撰寫內容**
   - 直接輸入或使用快速插入模板
   - 可自由編輯和修改

4. **設定簽名檔**（可選）
   - 勾選「自動附加簽名檔」
   - 在右側設定簽名檔資訊
   - 點擊「儲存簽名檔」保存

5. **預覽簽名檔**
   - 查看簽名檔預覽區域確認格式

6. **發送郵件**
   - 點擊 "📧 發送郵件" 按鈕
   - 系統會顯示發送成功訊息

---

## Resend API 整合

### 當前狀態

目前系統已完成介面開發，但 **Resend API 尚未整合**。郵件發送功能為預覽模式。

### 整合步驟

#### 1. 取得 Resend API Key

1. 前往 [Resend](https://resend.com/) 註冊帳號
2. 在控制台創建新的 API Key
3. 將 API Key 保存到環境變數

#### 2. 設定環境變數

在 `.env` 或 `.env.local` 中加入：

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

對於 Cloudflare Workers：
```bash
wrangler secret put RESEND_API_KEY
# 輸入您的 API Key
```

#### 3. 驗證域名（Domain Verification）

**在 Resend 控制台**：
1. 進入 "Domains" 設定
2. 添加您的域名：`lihe-preform.com`
3. 按照指示添加 DNS 記錄：
   - SPF: `v=spf1 include:_spf.resend.com ~all`
   - DKIM: Resend 提供的 DKIM 記錄
4. 等待驗證完成（通常幾分鐘到幾小時）

#### 4. 更新 API 端點代碼

**更新模板郵件 API** (`src/app/api/contact/submit/route.ts`):

找到 `sendEmail` 函數，將註解的代碼取消註解並更新：

```typescript
async function sendEmail(to: string, subject: string, html: string) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Lihe Precision <noreply@lihe-preform.com>',
      to: [to],
      subject: subject,
      html: html,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send email via Resend');
  }

  const result = await response.json();
  return { success: true, messageId: result.id };
}
```

**更新官方郵件 API** (`src/app/api/admin/send-email/route.ts`):

找到 TODO 註解區域，取消註解並更新：

```typescript
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'Lihe Precision <sales@lihe-preform.com>',
    to: [to],
    subject: subject,
    html: html,
  }),
});

if (!response.ok) {
  const error = await response.json();
  throw new Error(error.message || 'Failed to send email via Resend');
}

const result = await response.json();
return NextResponse.json({
  success: true,
  messageId: result.id
});
```

#### 5. 測試郵件發送

**測試自動回覆**：
1. 訪問聯絡頁面：`/en/contact`
2. 填寫並提交表單
3. 檢查收件匣是否收到感謝郵件
4. 檢查 sales@lihe-preform.com 是否收到通知

**測試官方郵件**：
1. 訪問 `/admin/send-email`
2. 輸入測試收件人（自己的 Email）
3. 填寫主旨和內容
4. 點擊發送
5. 檢查收件匣

### DNS 設定範例

在您的 DNS 提供商（如 Cloudflare）添加以下記錄：

```
Type: TXT
Name: @
Content: v=spf1 include:_spf.resend.com ~all
TTL: Auto

Type: CNAME
Name: resend._domainkey
Content: resend._domainkey.resend.com
TTL: Auto
```

---

## 最佳實踐

### Email 模板設計

1. **保持簡潔**
   - 使用清晰的結構
   - 突出重要資訊
   - 避免過多圖片

2. **測試多種郵件客戶端**
   - Gmail
   - Outlook
   - Apple Mail
   - 手機版郵件 App

3. **響應式設計**
   - 使用最大寬度 600px
   - 避免使用固定寬度
   - 測試手機顯示效果

### 郵件發送

1. **撰寫專業內容**
   - 使用正式語氣
   - 檢查拼寫和語法
   - 保持品牌一致性

2. **個人化**
   - 使用客戶名字
   - 引用具體的詢問內容
   - 提供相關產品資訊

3. **快速回應**
   - 在 24 小時內回覆
   - 提供明確的後續步驟
   - 包含聯絡資訊

### 安全性

1. **保護 API Key**
   - 不要將 API Key 提交到 Git
   - 使用環境變數
   - 定期更換 Key

2. **驗證收件人**
   - 檢查 Email 格式
   - 避免發送到無效地址
   - 實施速率限制

3. **監控使用情況**
   - 追蹤發送數量
   - 檢查退信率
   - 監控 API 配額

---

## 疑難排解

### 郵件未發送

**檢查項目**：
1. ✅ Resend API Key 是否正確設定
2. ✅ 域名是否已驗證
3. ✅ DNS 記錄是否正確配置
4. ✅ API 請求格式是否正確
5. ✅ 檢查 Resend 控制台的發送日誌

### 郵件進入垃圾郵件

**改善方法**：
1. 完成 SPF、DKIM 設定
2. 避免垃圾郵件關鍵字
3. 保持發送頻率正常
4. 提供退訂連結（如適用）

### 模板變數未替換

**檢查**：
1. 變數名稱拼寫正確（區分大小寫）
2. 使用雙大括號 `{{variable}}`
3. 確認表單提交的資料完整

### 簽名檔未顯示

**解決方案**：
1. 檢查「自動附加簽名檔」是否勾選
2. 確認簽名檔已儲存
3. 清除瀏覽器快取重試

---

## 進階功能（未來計劃）

- [ ] 郵件範本預覽功能
- [ ] 發送歷史記錄
- [ ] 批量發送郵件
- [ ] 自動化郵件排程
- [ ] 郵件開信率追蹤
- [ ] A/B 測試不同模板
- [ ] 附件上傳功能
- [ ] 郵件草稿儲存

---

## 支援

如有問題或需要協助：
- 參考 `/docs/CHANGELOG.md` 查看更新記錄
- 參考 `/docs/CONTACT_FORM_SETUP.md` 了解聯絡表單設定
- 聯絡技術團隊取得支援

---

## 版本資訊

- **版本**: 0.7.2
- **更新日期**: 2026-03-08
- **狀態**: Email 模板管理已完成，Resend API 待整合
