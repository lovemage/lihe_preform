#!/bin/bash

# Cloudflare Workers 部署腳本（保持環境變數）
# 使用方法: ./scripts/deploy-with-secrets.sh [worker-name]

set -e

WORKER_NAME="${1:-lihepreform02}"

echo "🚀 開始部署 Cloudflare Worker: $WORKER_NAME"

# 檢查是否有 .dev.vars 檔案
if [ ! -f .dev.vars ]; then
    echo "❌ 錯誤: .dev.vars 檔案不存在"
    echo "請先創建 .dev.vars 檔案並設定環境變數"
    exit 1
fi

echo ""
echo "📦 1. 建置應用程式..."
npm run cf:build

echo ""
echo "🔐 2. 設定 Secrets（敏感資訊）..."
echo "   這些變數不會出現在 wrangler.toml 中，更安全"

# 從 .dev.vars 讀取並設定 secrets
# 注意: wrangler secret put 需要互動式輸入，所以我們使用 echo 管道傳入
while IFS='=' read -r key value; do
    # 跳過空行和註解
    if [[ -z "$key" || "$key" =~ ^[[:space:]]*# ]]; then
        continue
    fi

    # 移除前後空白
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)

    if [[ -n "$key" && -n "$value" ]]; then
        echo "   設定 secret: $key"
        echo "$value" | wrangler secret put "$key" --name "$WORKER_NAME" 2>&1 | grep -v "Enter"
    fi
done < .dev.vars

echo ""
echo "🌐 3. 部署到 Cloudflare..."
npx opennextjs-cloudflare deploy

echo ""
echo "✅ 部署完成！"
echo ""
echo "💡 提示："
echo "   - Secrets 已經設定好，不會在每次部署時清空"
echo "   - 如需更新 secret，請使用："
echo "     wrangler secret put VARIABLE_NAME --name $WORKER_NAME"
echo "   - 查看所有 secrets："
echo "     wrangler secret list --name $WORKER_NAME"
