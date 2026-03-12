# Looker Studio → Google Sheets 自動転記 セットアップ手順

## 前提条件

- Google Cloud プロジェクトがあること
- `gcloud` CLI がインストール済みであること
- Docker がインストール済みであること
- Python 3.10+ がインストール済みであること

---

## 手順1: ローカル環境のセットアップ

```bash
cd looker-to-sheets

# Python 仮想環境
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
```

---

## 手順2: Googleログイン & Cookie保存（初回のみ）

```bash
python login.py
```

1. ブラウザが自動で開きます
2. Googleアカウントでログインしてください
3. Looker Studioのレポートが表示されたら、ターミナルでEnterキーを押す
4. `auth_state/state.json` にCookieが保存されます

> Cookieの有効期限が切れたら（月1回程度）再度 `python login.py` を実行してください。

---

## 手順3: ローカルでテスト実行

```bash
python main.py
```

成功すると以下が表示されます：
- 取得した行数
- 新規作成されたスプレッドシートのURL

**スプレッドシートのURLを控えてください**（次の手順で使います）。

---

## 手順4: GCP サービスアカウントの作成

```bash
export GCP_PROJECT_ID="your-project-id"

# サービスアカウント作成
gcloud iam service-accounts create looker-sheets-sa \
    --display-name="Looker to Sheets SA" \
    --project="${GCP_PROJECT_ID}"

# キーファイルを生成
gcloud iam service-accounts keys create service-account.json \
    --iam-account="looker-sheets-sa@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
    --project="${GCP_PROJECT_ID}"
```

---

## 手順5: Secret Manager に認証情報を保存

```bash
# 必要な API を有効化
gcloud services enable \
    secretmanager.googleapis.com \
    run.googleapis.com \
    cloudscheduler.googleapis.com \
    containerregistry.googleapis.com \
    sheets.googleapis.com \
    drive.googleapis.com \
    --project="${GCP_PROJECT_ID}"

# サービスアカウントキーを保存
gcloud secrets create looker-sheets-sa-key \
    --replication-policy="automatic" \
    --project="${GCP_PROJECT_ID}"

gcloud secrets versions add looker-sheets-sa-key \
    --data-file="service-account.json" \
    --project="${GCP_PROJECT_ID}"

# Googleログインの Cookie を保存
gcloud secrets create looker-auth-state \
    --replication-policy="automatic" \
    --project="${GCP_PROJECT_ID}"

gcloud secrets versions add looker-auth-state \
    --data-file="auth_state/state.json" \
    --project="${GCP_PROJECT_ID}"
```

---

## 手順6: Cloud Run にデプロイ

```bash
export GCP_PROJECT_ID="your-project-id"
export LOOKER_STUDIO_URL="https://lookerstudio.google.com/u/0/reporting/2d1fa433-8813-4f1a-aee0-1d3c95f8a2fe/page/IvnUD"
export SPREADSHEET_ID="手順3で控えたスプレッドシートのID"

./deploy.sh
```

---

## 手順7: 手動テスト

```bash
# Cloud Run Job を手動実行
gcloud run jobs execute looker-to-sheets \
    --region asia-northeast1 \
    --project "${GCP_PROJECT_ID}"

# ログを確認
gcloud logging read "resource.type=cloud_run_job AND resource.labels.job_name=looker-to-sheets" \
    --limit 50 \
    --project "${GCP_PROJECT_ID}"
```

---

## Cookie の更新手順（月1回程度）

Googleのログインセッションが切れた場合：

```bash
# 1. ローカルで再ログイン
python login.py

# 2. Secret Manager を更新
gcloud secrets versions add looker-auth-state \
    --data-file="auth_state/state.json" \
    --project="${GCP_PROJECT_ID}"
```

---

## スケジュール変更

デフォルトは **毎日9:00 (JST)** です。変更する場合：

```bash
# 平日8時に変更する例
gcloud scheduler jobs update http looker-to-sheets-scheduler \
    --schedule "0 8 * * 1-5" \
    --location asia-northeast1 \
    --project "${GCP_PROJECT_ID}"
```
