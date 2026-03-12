"""日付フィルターのDOM構造を確認"""
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

    # 日付フィルターを探す
    text = page.inner_text("body")
    print("=== ページテキスト（日付付近） ===")
    for line in text.split("\n"):
        if "2026" in line or "日付" in line or "calendar" in line.lower():
            print(f"  {line[:100]}")

    # 日付フィルター要素を探す
    date_info = page.evaluate("""
        () => {
            const results = [];
            // テキストに日付を含む要素を探す
            const allElements = document.querySelectorAll('*');
            for (const el of allElements) {
                const text = el.textContent.trim();
                if (text.match(/^\\d{4}\\/\\d{2}\\/\\d{2}\\s*-\\s*\\d{4}\\/\\d{2}\\/\\d{2}$/) ||
                    text.match(/^calendar_today/)) {
                    results.push({
                        tag: el.tagName,
                        text: text.substring(0, 80),
                        class: el.className.substring(0, 60),
                        clickable: el.onclick !== null || el.tagName === 'BUTTON' || el.getAttribute('role') === 'button',
                        ariaLabel: el.getAttribute('aria-label'),
                    });
                }
            }
            return results.slice(0, 10);
        }
    """)
    print("\n=== 日付フィルター候補 ===")
    for info in date_info:
        print(f"  <{info['tag']}> class={info['class'][:40]} clickable={info['clickable']} aria={info['ariaLabel']}")
        print(f"    text: {info['text']}")

    # クリック可能な日付要素を探して座標を取得
    date_element = page.evaluate("""
        () => {
            const allElements = document.querySelectorAll('*');
            for (const el of allElements) {
                const text = el.textContent.trim();
                if (text.match(/^\\d{4}\\/\\d{2}\\/\\d{2}\\s*-\\s*\\d{4}\\/\\d{2}\\/\\d{2}$/)) {
                    const rect = el.getBoundingClientRect();
                    return { text: text, x: rect.x, y: rect.y, w: rect.width, h: rect.height };
                }
            }
            return null;
        }
    """)
    print(f"\n=== 日付要素の位置 ===")
    print(f"  {date_element}")

    browser.close()
