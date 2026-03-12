"""iframe / Shadow DOM を確認"""
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

    # iframe を調べる
    iframes = page.frames
    print(f"=== フレーム数: {len(iframes)} ===")
    for i, frame in enumerate(iframes):
        print(f"  [{i}] URL: {frame.url[:100]}")
        has_table = frame.evaluate("document.querySelectorAll('table, tr, td, [role=\"row\"]').length")
        has_kitayama = frame.evaluate("document.body ? document.body.textContent.includes('北山') : false")
        print(f"       テーブル要素: {has_table} 件, 「北山」: {has_kitayama}")

        if has_kitayama:
            print(f"\n  >>> フレーム [{i}] にデータあり！ <<<")
            tr_count = frame.evaluate("document.querySelectorAll('tr').length")
            td_count = frame.evaluate("document.querySelectorAll('td').length")
            row_count = frame.evaluate('document.querySelectorAll(\'[role="row"]\').length')
            div_count = frame.evaluate("document.querySelectorAll('div').length")
            print(f"       tr: {tr_count}, td: {td_count}, role=row: {row_count}, div: {div_count}")

            # 最初の数行のデータを抽出してみる
            sample = frame.evaluate("""
                () => {
                    const trs = document.querySelectorAll('tr');
                    if (trs.length > 0) {
                        return Array.from(trs).slice(0, 3).map(tr => {
                            return Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim()).slice(0, 8);
                        });
                    }
                    // tr がない場合、role="row" を試す
                    const rows = document.querySelectorAll('[role="row"]');
                    if (rows.length > 0) {
                        return Array.from(rows).slice(0, 3).map(r => {
                            const cells = r.querySelectorAll('[role="cell"], [role="gridcell"]');
                            return Array.from(cells).map(c => c.textContent.trim()).slice(0, 8);
                        });
                    }
                    return 'no table/row found';
                }
            """)
            print(f"       サンプル: {sample}")

    browser.close()
