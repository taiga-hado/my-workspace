"""日付フィルターのDOM構造を詳細調査（input以外も調べる）"""
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
    print(f"日付フィルター位置: {pos}")
    page.mouse.click(pos['x'], pos['y'])
    page.wait_for_timeout(3000)

    # 1. 日付ピッカー周辺のテキスト内容を取得
    print("\n=== 日付ピッカー周辺のテキスト ===")
    picker_text = page.evaluate("""
        () => {
            // 「適用」ボタンを探して、その親コンテナのテキストを取得
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            let applyEl = null;
            while (walker.nextNode()) {
                if (walker.currentNode.textContent.trim() === '適用') {
                    applyEl = walker.currentNode.parentElement;
                    break;
                }
            }
            if (applyEl) {
                // 適用ボタンから親を辿ってピッカー全体を見つける
                let container = applyEl;
                for (let i = 0; i < 10; i++) {
                    container = container.parentElement;
                    if (!container) break;
                    if (container.offsetHeight > 200) {
                        return {
                            tag: container.tagName,
                            class: container.className?.substring?.(0, 100) || '',
                            text: container.innerText?.substring?.(0, 500) || '',
                            html: container.innerHTML?.substring?.(0, 2000) || '',
                        };
                    }
                }
            }
            return null;
        }
    """)
    if picker_text:
        print(f"Tag: {picker_text['tag']}")
        print(f"Class: {picker_text['class']}")
        print(f"Text:\n{picker_text['text']}")

    # 2. contenteditable要素を調べる
    print("\n=== contenteditable 要素 ===")
    editables = page.evaluate("""
        () => {
            const els = document.querySelectorAll('[contenteditable]');
            return Array.from(els).map(el => {
                const rect = el.getBoundingClientRect();
                return {
                    tag: el.tagName,
                    contenteditable: el.getAttribute('contenteditable'),
                    text: el.textContent.trim().substring(0, 50),
                    visible: rect.width > 0 && rect.height > 0,
                    x: Math.round(rect.x), y: Math.round(rect.y),
                    w: Math.round(rect.width), h: Math.round(rect.height),
                };
            });
        }
    """)
    print(f"  contenteditable要素数: {len(editables)}")
    for i, el in enumerate(editables):
        if el['visible']:
            print(f"  [{i}] {el['tag']} editable={el['contenteditable']} text='{el['text']}' pos=({el['x']},{el['y']}) size=({el['w']}x{el['h']})")

    # 3. 日付テキストを含む要素を直接探す
    print("\n=== 日付テキストを含む要素 ===")
    date_elements = page.evaluate("""
        () => {
            const results = [];
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
                const text = walker.currentNode.textContent.trim();
                if (/^\\d{4}\\/\\d{2}\\/\\d{2}$/.test(text)) {
                    const el = walker.currentNode.parentElement;
                    const rect = el.getBoundingClientRect();
                    results.push({
                        text: text,
                        tag: el.tagName,
                        class: el.className?.substring?.(0, 80) || '',
                        role: el.getAttribute('role'),
                        ariaLabel: el.getAttribute('aria-label'),
                        editable: el.getAttribute('contenteditable'),
                        x: Math.round(rect.x), y: Math.round(rect.y),
                        w: Math.round(rect.width), h: Math.round(rect.height),
                        parentTag: el.parentElement?.tagName,
                        parentClass: el.parentElement?.className?.substring?.(0, 80) || '',
                        parentRole: el.parentElement?.getAttribute('role'),
                    });
                }
            }
            return results;
        }
    """)
    print(f"  日付テキスト要素数: {len(date_elements)}")
    for i, el in enumerate(date_elements):
        print(f"  [{i}] text='{el['text']}' tag={el['tag']} class={el['class']}")
        print(f"       role={el['role']} aria={el['ariaLabel']} editable={el['editable']}")
        print(f"       pos=({el['x']},{el['y']}) size=({el['w']}x{el['h']})")
        print(f"       parent: {el['parentTag']} class={el['parentClass']} role={el['parentRole']}")

    # 4. 「開始日」「終了日」ラベルの周辺要素
    print("\n=== 開始日/終了日ラベル周辺 ===")
    labels = page.evaluate("""
        () => {
            const results = [];
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
                const text = walker.currentNode.textContent.trim();
                if (text === '開始日' || text === '終了日') {
                    const el = walker.currentNode.parentElement;
                    const rect = el.getBoundingClientRect();
                    // 兄弟要素も調べる
                    const parent = el.parentElement;
                    const siblings = parent ? Array.from(parent.children).map(c => ({
                        tag: c.tagName,
                        text: c.textContent.trim().substring(0, 50),
                        class: c.className?.substring?.(0, 50) || '',
                        role: c.getAttribute('role'),
                    })) : [];
                    results.push({
                        label: text,
                        tag: el.tagName,
                        x: Math.round(rect.x), y: Math.round(rect.y),
                        parentTag: parent?.tagName,
                        parentClass: parent?.className?.substring?.(0, 80) || '',
                        siblings: siblings,
                    });
                }
            }
            return results;
        }
    """)
    for label in labels:
        print(f"\n  '{label['label']}' - tag={label['tag']} pos=({label['x']},{label['y']})")
        print(f"  parent: {label['parentTag']} class={label['parentClass']}")
        print(f"  siblings:")
        for s in label['siblings']:
            print(f"    - {s['tag']} role={s['role']} class={s['class']} text='{s['text']}'")

    # 5. スクリーンショットを保存
    page.screenshot(path="datepicker_open.png", full_page=False)
    print("\n✅ スクリーンショットを datepicker_open.png に保存しました")

    browser.close()
