#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Dexter JP Stock VPS デプロイスクリプト
#
# 使い方:
#   chmod +x scripts/deploy.sh
#   DOMAIN=yourdomain.com CERT_EMAIL=you@example.com ./scripts/deploy.sh
#
# 前提条件:
#   - VPS に Docker + Docker Compose がインストール済み
#   - ドメインの A レコードが VPS の IP に向いている
#   - .env ファイルに本番用の環境変数が設定済み
# =============================================================================

set -euo pipefail

DOMAIN="${DOMAIN:?DOMAIN 環境変数を設定してください (例: DOMAIN=dexter.example.com)}"
CERT_EMAIL="${CERT_EMAIL:?CERT_EMAIL 環境変数を設定してください}"

echo "=== Dexter JP Stock デプロイ開始 ==="
echo "ドメイン: $DOMAIN"

# --- 1. 環境変数ファイルの確認 ---
if [[ ! -f .env ]]; then
  echo "ERROR: .env ファイルが見つかりません。.env.example をコピーして設定してください。"
  exit 1
fi

# --- 2. Prisma マイグレーション ---
echo ">>> DB マイグレーション実行中..."
docker compose run --rm app sh -c "npx prisma migrate deploy"

# --- 3. nginx 用の証明書シンボリックリンク準備 ---
# certbot は ./docker/certs/live/${DOMAIN}/ に証明書を生成する
# nginx.conf は /etc/nginx/certs/live/fullchain.pem を参照する
CERT_DIR="./docker/certs/live"
mkdir -p "$CERT_DIR"

if [[ ! -f "$CERT_DIR/fullchain.pem" ]]; then
  echo ">>> Let's Encrypt 証明書を初回発行中..."
  echo "    (HTTP ポート 80 が VPS に開放されている必要があります)"

  # Step 1: nginx を HTTP only モードで起動（ACME challenge のため）
  docker compose up -d nginx

  # Step 2: certbot で証明書発行
  DOMAIN="$DOMAIN" CERT_EMAIL="$CERT_EMAIL" \
    docker compose --profile certbot run --rm certbot

  # Step 3: 証明書ファイルをフラットにリンク（nginx.conf の参照パスに合わせる）
  LETSENCRYPT_DIR="./docker/certs/live/${DOMAIN}"
  ln -sf "${LETSENCRYPT_DIR}/fullchain.pem" "$CERT_DIR/fullchain.pem"
  ln -sf "${LETSENCRYPT_DIR}/privkey.pem"   "$CERT_DIR/privkey.pem"

  echo ">>> 証明書発行完了"
else
  echo ">>> 証明書は既に存在します（スキップ）"
fi

# --- 4. 全サービス起動 ---
echo ">>> Docker Compose で全サービス起動中..."
docker compose up -d --build

# --- 5. 動作確認 ---
echo ">>> 起動状態の確認..."
sleep 5
docker compose ps

echo ""
echo "=== デプロイ完了 ==="
echo "サービスURL: https://$DOMAIN"
echo ""
echo "ログ確認: docker compose logs -f app"
echo "証明書更新 (cronに追加推奨):"
echo "  0 3 1 * * cd $(pwd) && DOMAIN=$DOMAIN CERT_EMAIL=$CERT_EMAIL docker compose --profile certbot run --rm certbot renew && docker compose exec nginx nginx -s reload"
