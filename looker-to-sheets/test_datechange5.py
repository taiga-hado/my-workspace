"""カレンダー操作で日付フィルター変更をテスト"""
from playwright.sync_api import sync_playwright
from datetime import datetime
from dateutil.relativedelta import relativedelta

AUTH_STATE = "auth_state/state.json"
URL = "https://lookerstudio.google.com/u/0/reporting/2d1fa433-8813-4f1a-aee0-1d3c95f8a2fe/page/IvnUD"
DATE_RANGE_MONTHS = 2

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

    today = datetime.now()
    start_date = today - relativedelta(months=DATE_RANGE_MONTHS)
    print(f"今日: {today.strftime('%Y/%m/%d')}")
    print(f"開始日ターゲット: {start_date.strftime('%Y/%m/%d')}")

    # 変更前の日付表示を取得
    before_text = page.evaluate("""
        () => {
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
                const text = walker.currentNode.textContent.trim();
                if (/^\\d{4}\\/\\d{2}\\/\\d{2}\\s+-\\s+\\d{4}\\/\\d{2}\\/\\d{2}$/.test(text)) {
                    return text;
                }
            }
            return null;
        }
    """)
    print(f"\n変更前の日付フィルター: {before_text}")

    # ---- 日付フィルター変更処理 ----
    # 1. 日付フィルターをクリック
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
    print("日付ピッカーを開きました")

    # 2. 開始日カレンダーの現在の月を読み取る
    current_month_info = page.evaluate("""
        () => {
            const startPicker = document.querySelector('.start-date-picker');
            if (!startPicker) return null;
            const btn = startPicker.querySelector('.mat-calendar-period-button');
            if (!btn) return null;
            const text = btn.textContent.trim();
            const m = text.match(/(\\d{4})年(\\d{1,2})月/);
            if (!m) return null;
            return { year: parseInt(m[1]), month: parseInt(m[2]), text: text };
        }
    """)
    print(f"開始日カレンダーの現在の月: {current_month_info}")

    # 3. ターゲット月まで何ヶ月戻るか
    current_ym = current_month_info['year'] * 12 + current_month_info['month']
    target_ym = start_date.year * 12 + start_date.month
    months_back = current_ym - target_ym
    print(f"ターゲット: {start_date.year}年{start_date.month}月 → {months_back}ヶ月戻る")

    # 4. 前月ボタンをクリック
    for i in range(months_back):
        clicked = page.evaluate("""
            () => {
                const startPicker = document.querySelector('.start-date-picker');
                if (!startPicker) return false;
                const prevBtn = startPicker.querySelector('.mat-calendar-previous-button');
                if (prevBtn) {
                    prevBtn.click();
                    return true;
                }
                const controls = startPicker.querySelector('.mat-calendar-controls');
                if (!controls) return false;
                const navBtns = controls.querySelectorAll('button:not(.mat-calendar-period-button)');
                if (navBtns.length >= 1) {
                    navBtns[0].click();
                    return true;
                }
                return false;
            }
        """)
        print(f"  前月ボタンクリック ({i+1}/{months_back}): {clicked}")
        page.wait_for_timeout(500)

    # 確認
    new_month = page.evaluate("""
        () => {
            const startPicker = document.querySelector('.start-date-picker');
            if (!startPicker) return null;
            const btn = startPicker.querySelector('.mat-calendar-period-button');
            return btn ? btn.textContent.trim() : null;
        }
    """)
    print(f"月遷移後: {new_month}")

    # 5. ターゲット日をクリック
    target_day = start_date.day
    day_clicked = page.evaluate("""
        (targetDay) => {
            const startPicker = document.querySelector('.start-date-picker');
            if (!startPicker) return { clicked: false, info: 'no start-date-picker' };
            const buttons = startPicker.querySelectorAll('.mat-calendar-body button, .mat-calendar-body-cell');
            const dayTexts = [];
            for (const btn of buttons) {
                const text = btn.textContent.trim();
                dayTexts.push(text);
                if (text === String(targetDay)) {
                    btn.click();
                    return { clicked: true, day: text };
                }
            }
            return { clicked: false, availableDays: dayTexts.slice(0, 10) };
        }
    """, target_day)
    print(f"日付クリック結果: {day_clicked}")
    page.wait_for_timeout(1000)

    # 6. 適用ボタン
    apply_clicked = page.evaluate("""
        () => {
            const dialog = document.querySelector('.ng2-date-picker-dialog');
            if (!dialog) return false;
            const buttons = dialog.querySelectorAll('button');
            for (const btn of buttons) {
                const text = btn.textContent.trim();
                if (text === '適用' || text === 'Apply') {
                    btn.click();
                    return true;
                }
            }
            return false;
        }
    """)
    print(f"適用ボタンクリック: {apply_clicked}")
    page.wait_for_timeout(10000)

    # 変更後の日付表示を取得
    after_text = page.evaluate("""
        () => {
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
                const text = walker.currentNode.textContent.trim();
                if (/^\\d{4}\\/\\d{2}\\/\\d{2}\\s+-\\s+\\d{4}\\/\\d{2}\\/\\d{2}$/.test(text)) {
                    return text;
                }
            }
            return null;
        }
    """)
    print(f"\n変更後の日付フィルター: {after_text}")

    # データ行数を確認
    import re
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
    text = page.inner_text("body")
    matches = ROW_PATTERN.findall(text)
    print(f"取得行数: {len(matches)}")
    if matches:
        print(f"最初の行: {matches[0][3]} {matches[0][4]} - 登録日: {matches[0][1]}")
        print(f"最後の行: {matches[-1][3]} {matches[-1][4]} - 登録日: {matches[-1][1]}")

    browser.close()
