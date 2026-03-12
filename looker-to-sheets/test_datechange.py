"""日付フィルター入力フィールドの詳細調査"""
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

    # 日付フィルターをクリック
    pos = page.evaluate("""
        () => {
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
                const text = walker.currentNode.textContent.trim();
                if (/^\\d{4}\\/\\d{2}\\/\\d{2}\\s+-\\s+\\d{4}\\/\\d{2}\\/\\d{2}$/.test(text)) {
                    const el = walker.currentNode.parentElement;
                    const rect = el.getBoundingClientRect();
                    return { x: rect.x + rect.width/2, y: rect.y + rect.height/2 };
                }
            }
            return null;
        }
    """)
    page.mouse.click(pos['x'], pos['y'])
    page.wait_for_timeout(3000)

    # すべてのinput要素を調査
    inputs = page.evaluate("""
        () => {
            const inputs = document.querySelectorAll('input');
            return Array.from(inputs).map(input => {
                const rect = input.getBoundingClientRect();
                return {
                    type: input.type,
                    value: input.value,
                    placeholder: input.placeholder,
                    ariaLabel: input.getAttribute('aria-label'),
                    name: input.name,
                    id: input.id,
                    visible: rect.width > 0 && rect.height > 0,
                    x: Math.round(rect.x), y: Math.round(rect.y),
                    w: Math.round(rect.width), h: Math.round(rect.height),
                };
            }).filter(i => i.visible);
        }
    """)
    print(f"=== 表示中のinput要素: {len(inputs)} 件 ===")
    for i, inp in enumerate(inputs):
        print(f"  [{i}] type={inp['type']} value='{inp['value']}' placeholder='{inp['placeholder']}' "
              f"aria={inp['ariaLabel']} pos=({inp['x']},{inp['y']}) size=({inp['w']}x{inp['h']})")

    browser.close()
