#!/usr/bin/env python3
"""
LINE WORKS Monitoring API 連携スクリプト
カウンセラーと求職者のトーク内容をダウンロードし、CSV形式で取得する。
"""

import jwt
import time
import requests
import os
import sys
from datetime import datetime, timedelta
from urllib.parse import quote


# === 設定 ===
CLIENT_ID = "iFV4s8r7iZDYyGJsnBjE"
CLIENT_SECRET = "oj_NGPKVPt"
SERVICE_ACCOUNT = "vghet.serviceaccount@hadoinc"
DOMAIN_ID = "500263115"
SCOPE = "monitoring.read"

# Private Key ファイルのパス
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PRIVATE_KEY_PATH = os.path.join(SCRIPT_DIR, "private.key")

# トークンエンドポイント
TOKEN_URL = "https://auth.worksmobile.com/oauth2/v2.0/token"

# Monitoring API エンドポイント
MONITORING_API_URL = "https://www.worksapis.com/v1.0/monitoring/message-contents/download"


def load_private_key():
    """Private Key ファイルを読み込む"""
    with open(PRIVATE_KEY_PATH, "r") as f:
        return f.read()


def generate_jwt(private_key):
    """JWT を生成する (RS256署名)"""
    now = int(time.time())
    payload = {
        "iss": CLIENT_ID,
        "sub": SERVICE_ACCOUNT,
        "iat": now,
        "exp": now + 3600,  # 60分後に満了
    }
    headers = {
        "alg": "RS256",
        "typ": "JWT",
    }
    token = jwt.encode(payload, private_key, algorithm="RS256", headers=headers)
    return token


def get_access_token(jwt_token):
    """Access Token を取得する"""
    data = {
        "assertion": jwt_token,
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "scope": SCOPE,
    }
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
    }
    response = requests.post(TOKEN_URL, data=data, headers=headers)

    if response.status_code != 200:
        print(f"[ERROR] Access Token 取得失敗: {response.status_code}")
        print(f"  Response: {response.text}")
        sys.exit(1)

    token_data = response.json()
    print(f"[OK] Access Token 取得成功 (有効期限: {token_data.get('expires_in')}秒)")
    return token_data["access_token"]


def download_talk_content(access_token, start_time, end_time):
    """
    トーク内容をダウンロードする
    start_time, end_time: YYYY-MM-DDThh:mm:ss+09:00 形式
    """
    # URL を手動構築 (+ を %2B にエンコードする必要がある)
    start_encoded = start_time.replace("+", "%2B")
    end_encoded = end_time.replace("+", "%2B")

    url = (
        f"{MONITORING_API_URL}"
        f"?startTime={start_encoded}"
        f"&endTime={end_encoded}"
        f"&language=ja_JP"
        f"&botMessageFilterType=exclude"
    )

    headers = {
        "Authorization": f"Bearer {access_token}",
    }

    print(f"\n[INFO] トーク内容ダウンロード中...")
    print(f"  期間: {start_time} ~ {end_time}")

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        print(f"[ERROR] ダウンロード失敗: {response.status_code}")
        print(f"  Response: {response.text}")
        return None

    # レスポンスがダウンロードURLを返す場合
    content_type = response.headers.get("Content-Type", "")

    if "application/json" in content_type:
        result = response.json()
        print(f"[OK] ダウンロードURL取得成功")

        # ダウンロードURLからCSVを取得
        if "downloadUrl" in result:
            csv_response = requests.get(result["downloadUrl"])
            if csv_response.status_code == 200:
                return csv_response.text
            else:
                print(f"[ERROR] CSV ダウンロード失敗: {csv_response.status_code}")
                return None
        return result
    else:
        # 直接CSVが返された場合
        print(f"[OK] トーク内容取得成功 ({len(response.content)} bytes)")
        return response.text


def save_csv(content, filename=None):
    """CSVをファイルに保存する"""
    if filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"talk_content_{timestamp}.csv"

    filepath = os.path.join(SCRIPT_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"[OK] CSVファイル保存: {filepath}")
    return filepath


def main():
    """メイン処理"""
    print("=" * 60)
    print("LINE WORKS Monitoring - トーク内容ダウンロード")
    print("=" * 60)

    # デフォルト: 直近7日間
    if len(sys.argv) >= 3:
        start_time = sys.argv[1]
        end_time = sys.argv[2]
    else:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        start_time = start_date.strftime("%Y-%m-%dT00:00:00+09:00")
        end_time = end_date.strftime("%Y-%m-%dT23:59:59+09:00")

    # 1. Private Key 読み込み
    print("\n[STEP 1] Private Key 読み込み...")
    private_key = load_private_key()
    print(f"[OK] Private Key 読み込み完了")

    # 2. JWT 生成
    print("\n[STEP 2] JWT 生成...")
    jwt_token = generate_jwt(private_key)
    print(f"[OK] JWT 生成完了")

    # 3. Access Token 取得
    print("\n[STEP 3] Access Token 取得...")
    access_token = get_access_token(jwt_token)

    # 4. トーク内容ダウンロード
    print("\n[STEP 4] トーク内容ダウンロード...")
    content = download_talk_content(access_token, start_time, end_time)

    if content:
        # 5. CSVファイルに保存
        filepath = save_csv(content if isinstance(content, str) else str(content))
        print(f"\n{'=' * 60}")
        print(f"完了！ファイル: {filepath}")
        print(f"{'=' * 60}")
    else:
        print("\n[WARN] ダウンロードしたデータがありません。")


if __name__ == "__main__":
    main()
