"""日付ピッカーダイアログのHTML構造を直接調査"""
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

    # ピッカーダイアログのHTML構造を取得
    print("=== ピッカーダイアログのHTML（上部のみ）===")
    html = page.evaluate("""
        () => {
            const dialog = document.querySelector('.ng2-date-picker-dialog');
            if (!dialog) return 'dialog not found';
            // HTMLの先頭部分のみ
            return dialog.innerHTML.substring(0, 3000);
        }
    """)
    print(html)

    # ドロップダウン要素を探す
    print("\n\n=== ドロップダウン関連要素 ===")
    dropdowns = page.evaluate("""
        () => {
            const dialog = document.querySelector('.ng2-date-picker-dialog');
            if (!dialog) return [];
            // select, dropdown, 矢印アイコンなどを探す
            const candidates = dialog.querySelectorAll(
                'select, [class*="dropdown"], [class*="select"], [class*="period"], [class*="preset"], [class*="range-type"]'
            );
            return Array.from(candidates).map(el => {
                const rect = el.getBoundingClientRect();
                return {
                    tag: el.tagName,
                    class: el.className?.substring?.(0, 100) || '',
                    text: el.textContent?.trim()?.substring?.(0, 80) || '',
                    visible: rect.width > 0 && rect.height > 0,
                    x: Math.round(rect.x), y: Math.round(rect.y),
                    w: Math.round(rect.width), h: Math.round(rect.height),
                };
            });
        }
    """)
    print(f"  候補要素数: {len(dropdowns)}")
    for i, d in enumerate(dropdowns):
        print(f"  [{i}] {d['tag']} class={d['class']} text='{d['text']}' visible={d['visible']} pos=({d['x']},{d['y']}) size=({d['w']}x{d['h']})")

    # 「過去30日間」のテキストを持つ要素の親要素を詳しく調べる
    print("\n=== 「過去30日間」要素の詳細 ===")
    preset_info = page.evaluate("""
        () => {
            const dialog = document.querySelector('.ng2-date-picker-dialog');
            if (!dialog) return null;
            const walker = document.createTreeWalker(dialog, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
                const text = walker.currentNode.textContent.trim();
                if (text.includes('過去') && text.includes('日間')) {
                    const el = walker.currentNode.parentElement;
                    const rect = el.getBoundingClientRect();
                    // 親を5段階まで調べる
                    const ancestors = [];
                    let current = el;
                    for (let i = 0; i < 5; i++) {
                        const r = current.getBoundingClientRect();
                        ancestors.push({
                            tag: current.tagName,
                            class: current.className?.substring?.(0, 100) || '',
                            role: current.getAttribute('role'),
                            x: Math.round(r.x), y: Math.round(r.y),
                            w: Math.round(r.width), h: Math.round(r.height),
                            childCount: current.children.length,
                        });
                        current = current.parentElement;
                        if (!current) break;
                    }
                    return {
                        text: text,
                        x: Math.round(rect.x), y: Math.round(rect.y),
                        ancestors: ancestors,
                        outerHTML: el.parentElement?.outerHTML?.substring?.(0, 1500) || '',
                    };
                }
            }
            return null;
        }
    """)
    if preset_info:
        print(f"  テキスト: {preset_info['text']}")
        print(f"  位置: ({preset_info['x']}, {preset_info['y']})")
        print(f"  祖先要素:")
        for a in preset_info['ancestors']:
            print(f"    {a['tag']} class={a['class']} role={a['role']} pos=({a['x']},{a['y']}) size=({a['w']}x{a['h']}) children={a['childCount']}")
        print(f"\n  parent outerHTML:\n{preset_info['outerHTML']}")

    # ピッカー内のクリック可能な要素を取得
    print("\n\n=== ピッカー内のボタン系要素 ===")
    buttons = page.evaluate("""
        () => {
            const dialog = document.querySelector('.ng2-date-picker-dialog');
            if (!dialog) return [];
            const els = dialog.querySelectorAll('button, [role="button"], [class*="button"], [tabindex]');
            return Array.from(els).map(el => {
                const rect = el.getBoundingClientRect();
                return {
                    tag: el.tagName,
                    text: el.textContent?.trim()?.substring?.(0, 50) || '',
                    class: el.className?.substring?.(0, 80) || '',
                    role: el.getAttribute('role'),
                    tabindex: el.getAttribute('tabindex'),
                    visible: rect.width > 0 && rect.height > 0,
                    x: Math.round(rect.x), y: Math.round(rect.y),
                    w: Math.round(rect.width), h: Math.round(rect.height),
                };
            }).filter(e => e.visible);
        }
    """)
    print(f"  ボタン系要素数: {len(buttons)}")
    for i, b in enumerate(buttons):
        print(f"  [{i}] {b['tag']} role={b['role']} tabindex={b['tabindex']} text='{b['text']}' pos=({b['x']},{b['y']}) size=({b['w']}x{b['h']})")

    browser.close()
