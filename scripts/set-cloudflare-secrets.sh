#!/bin/bash

# 設定 Cloudflare Workers Secrets
# 使用方法: ./scripts/set-cloudflare-secrets.sh [worker-name]

WORKER_NAME="${1:-lihepreform02}"

echo "🔐 設定 Cloudflare Worker Secrets"
echo "Worker 名稱: $WORKER_NAME"
echo ""
echo "請依次輸入以下 secrets 的值："
echo "(直接按 Enter 跳過該項目)"
echo ""

# Admin 相關
read -p "ADMIN_USERNAME (目前: admin): " admin_user
if [ -n "$admin_user" ]; then
    echo "$admin_user" | wrangler secret put ADMIN_USERNAME --name "$WORKER_NAME"
fi

read -p "ADMIN_PASSWORD: " admin_pass
if [ -n "$admin_pass" ]; then
    echo "$admin_pass" | wrangler secret put ADMIN_PASSWORD --name "$WORKER_NAME"
fi

read -p "ADMIN_SESSION_SECRET: " admin_secret
if [ -n "$admin_secret" ]; then
    echo "$admin_secret" | wrangler secret put ADMIN_SESSION_SECRET --name "$WORKER_NAME"
fi

# Resend API
read -p "RESEND_API_KEY: " resend_key
if [ -n "$resend_key" ]; then
    echo "$resend_key" | wrangler secret put RESEND_API_KEY --name "$WORKER_NAME"
fi

echo ""
echo "✅ Secrets 設定完成！"
echo ""
echo "查看已設定的 secrets:"
wrangler secret list --name "$WORKER_NAME"
