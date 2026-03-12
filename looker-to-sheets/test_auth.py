"""認証状態の確認: ページが正しく読み込めるかチェック"""
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

    # ページのタイトルとURLを確認
    print(f"Title: {page.title()}")
    print(f"URL: {page.url}")

    # ページテキストの先頭500文字
    text = page.inner_text("body")
    print(f"\nテキスト長: {len(text)} 文字")
    print(f"テキスト先頭:\n{text[:500]}")

    # スクリーンショット
    page.screenshot(path="auth_check.png", full_page=False)
    print("\n✅ auth_check.png に保存")

    browser.close()
