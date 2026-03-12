"""取得漏れの原因調査: 48件中42件しか取れていない"""
import re
from playwright.sync_api import sync_playwright
from datetime import datetime
from dateutil.relativedelta import relativedelta

AUTH_STATE = "auth_state/state.json"
URL = "https://lookerstudio.google.com/u/0/reporting/2d1fa433-8813-4f1a-aee0-1d3c95f8a2fe/page/IvnUD"
DATE_RANGE_MONTHS = 2

ROW_PATTERN = re.compile(
    r'(\d+)\.\s*'
    r'(\d{4}/\d{2}/\d{2})\s+'
    r'(\d+)\s+'
    r'(\S+)\s+'
    r'(\S+)\s+'
    r'(\S+@\S+)\s+'
    r'([\d\-: .]+|null)\s+'
    r'(面談済み|未面談|面談未確定)'
)

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

    # 日付フィルターを2ヶ月に変更
    today = datetime.now()
    start_date = today - relativedelta(months=DATE_RANGE_MONTHS)

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

    current_month_info = page.evaluate("""
        () => {
            const startPicker = document.querySelector('.start-date-picker');
            if (!startPicker) return null;
            const btn = startPicker.querySelector('.mat-calendar-period-button');
            if (!btn) return null;
            const text = btn.textContent.trim();
            const m = text.match(/(\\d{4})年(\\d{1,2})月/);
            if (!m) return null;
            return { year: parseInt(m[1]), month: parseInt(m[2]) };
        }
    """)

    current_ym = current_month_info['year'] * 12 + current_month_info['month']
    target_ym = start_date.year * 12 + start_date.month
    months_back = current_ym - target_ym

    for i in range(months_back):
        page.evaluate("""
            () => {
                const startPicker = document.querySelector('.start-date-picker');
                const prevBtn = startPicker.querySelector('.mat-calendar-previous-button');
                if (prevBtn) prevBtn.click();
                else {
                    const controls = startPicker.querySelector('.mat-calendar-controls');
                    const navBtns = controls.querySelectorAll('button:not(.mat-calendar-period-button)');
                    if (navBtns.length >= 1) navBtns[0].click();
                }
            }
        """)
        page.wait_for_timeout(500)

    page.evaluate("""
        (targetDay) => {
            const startPicker = document.querySelector('.start-date-picker');
            const buttons = startPicker.querySelectorAll('.mat-calendar-body button, .mat-calendar-body-cell');
            for (const btn of buttons) {
                if (btn.textContent.trim() === String(targetDay)) { btn.click(); break; }
            }
        }
    """, start_date.day)
    page.wait_for_timeout(1000)

    page.evaluate("""
        () => {
            const dialog = document.querySelector('.ng2-date-picker-dialog');
            const buttons = dialog.querySelectorAll('button');
            for (const btn of buttons) {
                if (btn.textContent.trim() === '適用' || btn.textContent.trim() === 'Apply') {
                    btn.click(); break;
                }
            }
        }
    """)
    page.wait_for_timeout(10000)

    # ---- 調査開始 ----
    print("=" * 60)
    print("調査1: ページテキスト全体からの行番号探索")
    print("=" * 60)
    text = page.inner_text("body")

    # 行番号パターン（1. 2. 3. ... ）を探す
    row_numbers = re.findall(r'\b(\d{1,3})\.\s+\d{4}/\d{2}/\d{2}', text)
    print(f"行番号として検出: {len(row_numbers)} 件")
    print(f"行番号リスト: {row_numbers}")

    # 正規表現マッチ
    matches = ROW_PATTERN.findall(text)
    print(f"\n正規表現マッチ: {len(matches)} 件")
    matched_nums = [m[0] for m in matches]
    print(f"マッチした行番号: {matched_nums}")

    # マッチしなかった行番号
    all_nums = set(row_numbers)
    matched_set = set(matched_nums)
    missing = all_nums - matched_set
    if missing:
        print(f"\n⚠️ マッチしなかった行番号: {sorted(missing, key=int)}")

    print("\n" + "=" * 60)
    print("調査2: ページ内のテーブル行数をDOM確認")
    print("=" * 60)
    dom_info = page.evaluate("""
        () => {
            // テーブル内のテキストで行数を推定
            const bodyText = document.body.innerText;
            // 「件中」を含む表示を探す（例: "48件中 1-42件を表示"）
            const countMatch = bodyText.match(/(\\d+)\\s*件/);
            // ページネーションを探す
            const pagination = document.querySelectorAll('[class*="pagination"], [class*="pager"], [aria-label*="page"], [aria-label*="次"]');
            // 「もっと見る」「次のページ」を探す
            const moreButtons = [];
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
                const t = walker.currentNode.textContent.trim();
                if (t.includes('件中') || t.includes('of') || t.includes('次') || t.includes('more') || t.includes('ページ')) {
                    moreButtons.push(t.substring(0, 60));
                }
            }
            return {
                countMatch: countMatch ? countMatch[0] : null,
                paginationCount: pagination.length,
                relevantTexts: moreButtons,
            };
        }
    """)
    print(f"件数表示: {dom_info['countMatch']}")
    print(f"ページネーション要素: {dom_info['paginationCount']} 件")
    print(f"関連テキスト: {dom_info['relevantTexts']}")

    print("\n" + "=" * 60)
    print("調査3: テーブルのスクロール状況")
    print("=" * 60)
    scroll_info = page.evaluate("""
        () => {
            // スクロール可能なテーブルコンテナを探す
            const scrollables = [];
            document.querySelectorAll('div').forEach(div => {
                if (div.scrollHeight > div.clientHeight + 10 && div.clientHeight > 100) {
                    scrollables.push({
                        class: div.className?.substring?.(0, 60) || '',
                        scrollHeight: div.scrollHeight,
                        clientHeight: div.clientHeight,
                        scrollTop: div.scrollTop,
                        remaining: div.scrollHeight - div.clientHeight - div.scrollTop,
                    });
                }
            });
            return scrollables;
        }
    """)
    print(f"スクロール可能コンテナ: {len(scroll_info)} 件")
    for i, s in enumerate(scroll_info):
        print(f"  [{i}] class={s['class']}")
        print(f"       scrollHeight={s['scrollHeight']} clientHeight={s['clientHeight']} scrollTop={s['scrollTop']} remaining={s['remaining']}")

    print("\n" + "=" * 60)
    print("調査4: テーブルをスクロールして再取得")
    print("=" * 60)
    # スクロール可能なコンテナを最後までスクロール
    page.evaluate("""
        () => {
            document.querySelectorAll('div').forEach(div => {
                if (div.scrollHeight > div.clientHeight + 10 && div.clientHeight > 100) {
                    div.scrollTop = div.scrollHeight;
                }
            });
        }
    """)
    page.wait_for_timeout(3000)

    text_after_scroll = page.inner_text("body")
    matches_after = ROW_PATTERN.findall(text_after_scroll)
    print(f"スクロール後の正規表現マッチ: {len(matches_after)} 件")

    row_nums_after = [m[0] for m in matches_after]
    print(f"マッチした行番号: {row_nums_after}")

    # 最大行番号を確認
    if matches_after:
        max_num = max(int(m[0]) for m in matches_after)
        print(f"最大行番号: {max_num}")

    # マッチしない行がないか、テキストの該当部分を表示
    if len(matches_after) < 48:
        print(f"\nまだ {48 - len(matches_after)} 件不足")
        # テキストの末尾近くを確認
        lines = text_after_scroll.split('\n')
        # 行番号42以降のテキストを探す
        for line in lines:
            if re.search(r'\b4[0-9]\.\s', line):
                print(f"  >>> {line[:120]}")

    browser.close()
