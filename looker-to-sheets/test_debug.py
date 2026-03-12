"""DOM構造の詳細デバッグ"""
import os
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

    # どのセレクタが何件マッチするか調べる
    selectors = [
        'table',
        'table tbody tr',
        '[role="row"]',
        '[role="grid"]',
        '[role="table"]',
        '[role="cell"]',
        '[role="gridcell"]',
        'td',
        'tr',
    ]

    print("=== セレクタ別マッチ数 ===")
    for sel in selectors:
        count = page.evaluate(f'document.querySelectorAll(\'{sel}\').length')
        print(f"  {sel:<25} → {count} 件")

    print("\n=== tr 要素の詳細 ===")
    tr_info = page.evaluate("""
        () => {
            const trs = document.querySelectorAll('tr');
            return Array.from(trs).slice(0, 5).map((tr, i) => {
                const tds = tr.querySelectorAll('td');
                return {
                    index: i,
                    tdCount: tds.length,
                    className: tr.className.substring(0, 80),
                    role: tr.getAttribute('role'),
                    firstCellText: tds.length > 6 ? tds[6].textContent.trim().substring(0, 30) : '(N/A)',
                };
            });
        }
    """)
    for info in tr_info:
        print(f"  tr[{info['index']}]: {info['tdCount']} cells, role={info['role']}, class={info['className'][:50]}, cell[6]={info['firstCellText']}")

    # ページのタイトルやURLで正しいページか確認
    print(f"\n=== ページ情報 ===")
    print(f"  URL: {page.url}")
    print(f"  Title: {page.title()}")

    # 「北山」というテキストがページに含まれるか
    has_data = page.evaluate("document.body.textContent.includes('北山')")
    print(f"  「北山」が含まれる: {has_data}")

    browser.close()
