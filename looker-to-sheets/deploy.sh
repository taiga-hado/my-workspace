#!/bin/bash
# ============================================================
# Looker Studio → Sheets 自動転記  デプロイスクリプト
# ============================================================
set -euo pipefail

# ── 設定（ここを編集してください） ──────────────────────
PROJECT_ID="${GCP_PROJECT_ID:?GCP_PROJECT_ID を設定してください}"
REGION="asia-northeast1"
JOB_NAME="looker-to-sheets"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${JOB_NAME}"
SCHEDULE="0 9 * * *"  # 毎日9時に実行

# 環境変数（Cloud Run Job に渡す）
LOOKER_STUDIO_URL="${LOOKER_STUDIO_URL:?LOOKER_STUDIO_URL を設定してください}"
SPREADSHEET_ID="${SPREADSHEET_ID:-}"  # 空の場合は新規作成

# ── 1. Docker イメージのビルド & プッシュ ─────────────
echo ">>> Docker イメージをビルド中..."
docker build -t "${IMAGE_NAME}" .

echo ">>> Container Registry にプッシュ中..."
docker push "${IMAGE_NAME}"

# ── 2. Cloud Run Job の作成/更新 ──────────────────────
echo ">>> Cloud Run Job を作成中..."
gcloud run jobs create "${JOB_NAME}" \
    --image "${IMAGE_NAME}" \
    --region "${REGION}" \
    --memory "2Gi" \
    --cpu "1" \
    --task-timeout "300s" \
    --max-retries 1 \
    --set-env-vars "LOOKER_STUDIO_URL=${LOOKER_STUDIO_URL}" \
    --set-env-vars "SPREADSHEET_ID=${SPREADSHEET_ID}" \
    --set-env-vars "SHEET_NAME=面談データ" \
    --set-secrets "SERVICE_ACCOUNT_KEY_JSON=looker-sheets-sa-key:latest" \
    --set-secrets "AUTH_STATE_JSON=looker-auth-state:latest" \
    --project "${PROJECT_ID}" \
    2>/dev/null || \
gcloud run jobs update "${JOB_NAME}" \
    --image "${IMAGE_NAME}" \
    --region "${REGION}" \
    --memory "2Gi" \
    --set-env-vars "LOOKER_STUDIO_URL=${LOOKER_STUDIO_URL}" \
    --set-env-vars "SPREADSHEET_ID=${SPREADSHEET_ID}" \
    --set-env-vars "SHEET_NAME=面談データ" \
    --set-secrets "SERVICE_ACCOUNT_KEY_JSON=looker-sheets-sa-key:latest" \
    --set-secrets "AUTH_STATE_JSON=looker-auth-state:latest" \
    --project "${PROJECT_ID}"

# ── 3. Cloud Scheduler で定期実行 ─────────────────────
echo ">>> Cloud Scheduler ジョブを設定中..."
gcloud scheduler jobs create http "${JOB_NAME}-scheduler" \
    --location "${REGION}" \
    --schedule "${SCHEDULE}" \
    --time-zone "Asia/Tokyo" \
    --uri "https://${REGION}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${PROJECT_ID}/jobs/${JOB_NAME}:run" \
    --http-method POST \
    --oauth-service-account-email "${PROJECT_ID}@appspot.gserviceaccount.com" \
    --project "${PROJECT_ID}" \
    2>/dev/null || \
gcloud scheduler jobs update http "${JOB_NAME}-scheduler" \
    --location "${REGION}" \
    --schedule "${SCHEDULE}" \
    --time-zone "Asia/Tokyo" \
    --project "${PROJECT_ID}"

echo ""
echo "=== デプロイ完了 ==="
echo "スケジュール: 毎日 9:00 (JST)"
echo ""
echo "手動テスト実行:"
echo "  gcloud run jobs execute ${JOB_NAME} --region ${REGION} --project ${PROJECT_ID}"
