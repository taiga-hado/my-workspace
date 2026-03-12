"""日付フィルターのドロップダウンプリセットを調査"""
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

    # 「過去 30 日間」ドロップダウンを探してクリック
    print("=== ドロップダウンを探す ===")
    dropdown_pos = page.evaluate("""
        () => {
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
                const text = walker.currentNode.textContent.trim();
                if (text.includes('過去') && text.includes('日間')) {
                    const el = walker.currentNode.parentElement;
                    const rect = el.getBoundingClientRect();
                    return {
                        text: text,
                        tag: el.tagName,
                        class: el.className?.substring?.(0, 100) || '',
                        x: rect.x + rect.width/2,
                        y: rect.y + rect.height/2,
                        w: rect.width,
                        h: rect.height,
                    };
                }
            }
            return null;
        }
    """)
    print(f"  ドロップダウン: {dropdown_pos}")

    if dropdown_pos:
        page.mouse.click(dropdown_pos['x'], dropdown_pos['y'])
        page.wait_for_timeout(2000)

        # ドロップダウンメニューの選択肢を取得
        print("\n=== ドロップダウン選択肢 ===")
        options = page.evaluate("""
            () => {
                // menuitem, option, listbox 等のロールを探す
                const items = document.querySelectorAll(
                    '[role="menuitem"], [role="option"], [role="listbox"] *, .mat-menu-item, .mdc-list-item, .dropdown-item'
                );
                const results = [];
                items.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        results.push({
                            text: el.textContent.trim().substring(0, 50),
                            tag: el.tagName,
                            role: el.getAttribute('role'),
                            class: el.className?.substring?.(0, 80) || '',
                            x: Math.round(rect.x),
                            y: Math.round(rect.y),
                        });
                    }
                });
                return results;
            }
        """)
        print(f"  role-based 要素数: {len(options)}")
        for i, opt in enumerate(options):
            print(f"  [{i}] text='{opt['text']}' tag={opt['tag']} role={opt['role']}")

        # 万が一通常のリスト要素の場合
        options2 = page.evaluate("""
            () => {
                const items = document.querySelectorAll('mat-option, .mat-option, li, .menu-item');
                return Array.from(items).filter(el => {
                    const rect = el.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0;
                }).map(el => ({
                    text: el.textContent.trim().substring(0, 50),
                    tag: el.tagName,
                    class: el.className?.substring?.(0, 50) || '',
                }));
            }
        """)
        if options2:
            print(f"\n  mat-option/li 要素数: {len(options2)}")
            for i, opt in enumerate(options2):
                print(f"  [{i}] text='{opt['text']}' tag={opt['tag']} class={opt['class']}")

        # 全体的にテキストで探す
        print("\n=== ドロップダウン後の全テキスト（日付関連）===")
        all_texts = page.evaluate("""
            () => {
                const results = [];
                const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
                while (walker.nextNode()) {
                    const text = walker.currentNode.textContent.trim();
                    if (text && (text.includes('日間') || text.includes('カスタム') || text.includes('期間')
                        || text.includes('Custom') || text.includes('今日') || text.includes('昨日')
                        || text.includes('週') || text.includes('月') || text.includes('年')
                        || text.includes('日')
                    )) {
                        const el = walker.currentNode.parentElement;
                        const rect = el.getBoundingClientRect();
                        if (rect.width > 0 && rect.height > 0 && rect.x > 900) {
                            results.push({
                                text: text.substring(0, 60),
                                x: Math.round(rect.x),
                                y: Math.round(rect.y),
                                tag: el.tagName,
                            });
                        }
                    }
                }
                return results;
            }
        """)
        for t in all_texts:
            print(f"  [{t['x']},{t['y']}] {t['tag']}: '{t['text']}'")

        page.screenshot(path="datepicker_dropdown.png", full_page=False)
        print("\n✅ スクリーンショットを保存")

    browser.close()
