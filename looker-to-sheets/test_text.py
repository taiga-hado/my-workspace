"""テキストベースのデータ抽出テスト"""
import re
from playwright.sync_api import sync_playwright

AUTH_STATE = "auth_state/state.json"
URL = "https://lookerstudio.google.com/u/0/reporting/2d1fa433-8813-4f1a-aee0-1d3c95f8a2fe/page/IvnUD"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
    context = browser.new_context(
        storage_state=AUTH_STATE,
        viewport={"width": 1920, "height": 1080},
        locale="ja-JP",
    )
    page = context.new_page()
    page.goto(URL, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(15000)

    # ページ全体のテキストを取得
    text = page.inner_text("body")

    # 行番号パターンで分割: "1." で始まる行を検出
    # パターン: 番号. 日付 HRBCナンバー 姓 名 email 面談予定日時 ステータス
    pattern = r'(\d+)\.\s*(\d{4}/\d{2}/\d{2})\s+(\d+)\s+(\S+)\s+(\S+)\s+(\S+@\S+)\s+([\d\-: .]+|null)\s+(面談済み|未面談|面談未確定)'

    matches = re.findall(pattern, text)

    if matches:
        print(f"✅ {len(matches)} 行取得できました！\n")
        print(f"{'姓':<8} {'名':<8} {'面談予定日時':<24} {'面談実施のご状況'}")
        print("-" * 70)
        for m in matches[:5]:
            # m = (番号, 日付, HRBC, 姓, 名, email, 面談日時, ステータス)
            print(f"{m[3]:<8} {m[4]:<8} {m[6]:<24} {m[7]}")
        if len(matches) > 5:
            print(f"... 他 {len(matches) - 5} 行")
    else:
        print("❌ 正規表現でマッチしませんでした")
        print("\nページテキスト（先頭2000文字）:")
        print(text[:2000])

    browser.close()
