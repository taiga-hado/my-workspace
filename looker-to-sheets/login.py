"""
初回ログイン & Cookie保存スクリプト

ブラウザが開くのでGoogleアカウントで手動ログインし、
Looker Studioのレポートが表示されたらEnterキーを押してください。
ログイン状態（Cookie等）が auth_state/ に保存されます。
"""

import os
from playwright.sync_api import sync_playwright

LOOKER_STUDIO_URL = os.environ.get(
    "LOOKER_STUDIO_URL",
    "https://lookerstudio.google.com/u/0/reporting/2d1fa433-8813-4f1a-aee0-1d3c95f8a2fe/page/IvnUD",
)
STATE_DIR = os.path.join(os.path.dirname(__file__), "auth_state")


def main():
    print("=== Looker Studio ログイン & Cookie保存 ===\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # ブラウザを表示
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            locale="ja-JP",
        )
        page = context.new_page()

        print(f"Looker Studio を開きます: {LOOKER_STUDIO_URL}")
        page.goto(LOOKER_STUDIO_URL)

        print("\n" + "=" * 50)
        print("ブラウザでGoogleアカウントにログインしてください。")
        print("レポートが表示されたら、ここでEnterキーを押してください。")
        print("=" * 50 + "\n")
        input(">>> Enterキーで保存...")

        # ブラウザの認証状態を保存
        os.makedirs(STATE_DIR, exist_ok=True)
        state_path = os.path.join(STATE_DIR, "state.json")
        context.storage_state(path=state_path)

        browser.close()

    print(f"\n認証状態を保存しました: {state_path}")
    print("このファイルを Cloud Run の Secret として登録してください。")
    print("\n次のステップ:")
    print("  1. ローカルテスト: python main.py")
    print("  2. GCSにアップロード: gsutil cp auth_state/state.json gs://YOUR_BUCKET/auth_state.json")


if __name__ == "__main__":
    main()
