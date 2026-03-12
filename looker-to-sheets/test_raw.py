"""生データの列構成を確認するテスト"""
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
    page.wait_for_timeout(15000)  # 15秒待機

    # 生の行データを取得
    rows = page.evaluate("""
        () => {
            const rows = [];
            const tableRows = document.querySelectorAll('table tbody tr, [role="row"]');
            tableRows.forEach((row, i) => {
                const cells = row.querySelectorAll('td, [role="cell"], [role="gridcell"]');
                if (cells.length > 0) {
                    rows.push(Array.from(cells).map(c => c.textContent.trim()));
                }
            });
            if (rows.length === 0) {
                const allRows = document.querySelectorAll('[class*="row"]');
                allRows.forEach(row => {
                    const cells = row.querySelectorAll('[class*="cell"], span');
                    if (cells.length >= 3) {
                        rows.push(Array.from(cells).map(c => c.textContent.trim()));
                    }
                });
            }
            return rows;
        }
    """)

    print(f"取得行数: {len(rows)}\n")
    for i, row in enumerate(rows[:3]):
        print(f"--- 行 {i} ({len(row)} 列) ---")
        for j, cell in enumerate(row):
            print(f"  [{j}] {cell}")
        print()

    browser.close()
