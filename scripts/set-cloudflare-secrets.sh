#!/bin/bash

# 設定 Cloudflare Workers Secrets
# 使用方法: ./scripts/set-cloudflare-secrets.sh [worker-name]

WORKER_NAME="${1:-lihepreform02}"
ENV_FILE=".env"

echo "🔐 設定 Cloudflare Worker Secrets"
echo "Worker 名稱: $WORKER_NAME"
echo ""

# 檢查 .env 檔案是否存在
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ 找不到 .env 檔案"
    exit 1
fi

# 從 .env 讀取變數
echo "📖 從 .env 讀取變數..."
source "$ENV_FILE"

# 定義需要設定的 secrets（運行時需要的）
declare -A SECRETS=(
    ["ADMIN_USERNAME"]="$ADMIN_USERNAME"
    ["ADMIN_PASSWORD"]="$ADMIN_PASSWORD"
    ["ADMIN_SESSION_SECRET"]="$ADMIN_SESSION_SECRET"
    ["RESEND_API_KEY"]="$RESEND_API_KEY"
    ["CLOUDFLARE_D1_DATABASE_ID"]="$CLOUDFLARE_D1_DATABASE_ID"
    ["CLOUDFLARE_R2_ACCESS_KEY_ID"]="$CLOUDFLARE_R2_ACCESS_KEY_ID"
    ["CLOUDFLARE_R2_SECRET_ACCESS_KEY"]="$CLOUDFLARE_R2_SECRET_ACCESS_KEY"
    ["CLOUDFLARE_R2_BUCKET"]="$CLOUDFLARE_R2_BUCKET"
    ["CLOUDFLARE_R2_PUBLIC_BASE_URL"]="$CLOUDFLARE_R2_PUBLIC_BASE_URL"
    ["GEMINI_API_KEY"]="$GEMINI_API_KEY"
    ["NEXT_PUBLIC_YANDEX_METRICA_ID"]="$NEXT_PUBLIC_YANDEX_METRICA_ID"
)

echo ""
echo "準備設定以下 secrets："
for key in "${!SECRETS[@]}"; do
    if [ -n "${SECRETS[$key]}" ]; then
        echo "  ✓ $key"
    else
        echo "  ⚠ $key (空值，將跳過)"
    fi
done

echo ""
read -p "確定要繼續嗎？(y/N) " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "❌ 已取消"
    exit 0
fi

echo ""
echo "🚀 開始設定 secrets..."

# 設定所有 secrets
success_count=0
skip_count=0

for key in "${!SECRETS[@]}"; do
    value="${SECRETS[$key]}"
    if [ -n "$value" ]; then
        echo -n "設定 $key... "
        if echo "$value" | npx wrangler secret put "$key" --name "$WORKER_NAME" 2>/dev/null; then
            echo "✅"
            ((success_count++))
        else
            echo "❌ 失敗"
        fi
    else
        echo "跳過 $key (空值)"
        ((skip_count++))
    fi
done

echo ""
echo "✅ 設定完成！"
echo "   成功: $success_count 個"
echo "   跳過: $skip_count 個"
echo ""
echo "📋 查看已設定的 secrets:"
npx wrangler secret list --name "$WORKER_NAME"
