"""
Looker Studio テーブルデータ → Google Sheets 自動転記スクリプト

Playwrightでブラウザ操作し、Looker Studioのテーブルから
姓・名・面談予定日時・面談実施のご状況を取得してスプレッドシートに書き込む。
"""

import os
import json
import re
import time
import logging
from datetime import datetime

import subprocess
import tempfile

import gspread
from google.oauth2.service_account import Credentials
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

# ── 設定 ──────────────────────────────────────────────
LOOKER_STUDIO_URL = os.environ.get(
    "LOOKER_STUDIO_URL",
    "https://lookerstudio.google.com/u/0/reporting/2d1fa433-8813-4f1a-aee0-1d3c95f8a2fe/page/IvnUD",
)
SPREADSHEET_ID = os.environ.get("SPREADSHEET_ID", "1eCq2B-LjPgA8yzoBl93CaC2Ts-U5anloUHzAiuB05zE")
SHEET_NAME = os.environ.get("SHEET_NAME", "面談データ")
SERVICE_ACCOUNT_JSON = os.environ.get("SERVICE_ACCOUNT_JSON", "service-account.json")

# 取得する期間（月数）
DATE_RANGE_MONTHS = int(os.environ.get("DATE_RANGE_MONTHS", "2"))

# 認証状態（Cookie）のパス
AUTH_STATE_PATH = os.environ.get("AUTH_STATE_PATH", "auth_state/state.json")
# GCS から認証状態を取得する場合のバケットパス（例: gs://bucket/auth_state.json）
AUTH_STATE_GCS = os.environ.get("AUTH_STATE_GCS", "")

# 取得したい列（0-indexed）: 姓=3, 名=4, 面談予定日時=6, 面談実施のご状況=7
TARGET_COLUMNS = [3, 4, 6, 7]
HEADER_ROW = ["姓", "名", "面談予定日時", "面談実施のご状況"]

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


# ── 認証状態の取得 ────────────────────────────────────
def _get_auth_state_path() -> str:
    """認証状態ファイルのパスを返す。GCSからダウンロードが必要な場合は取得する。"""
    if AUTH_STATE_GCS:
        logger.info(f"GCS から認証状態を取得: {AUTH_STATE_GCS}")
        local_path = os.path.join(tempfile.gettempdir(), "auth_state.json")
        subprocess.run(
            ["gsutil", "cp", AUTH_STATE_GCS, local_path],
            check=True,
        )
        return local_path

    # 環境変数に認証状態JSONが直接ある場合（Secret Manager経由）
    auth_state_json = os.environ.get("AUTH_STATE_JSON")
    if auth_state_json:
        local_path = os.path.join(tempfile.gettempdir(), "auth_state.json")
        with open(local_path, "w") as f:
            f.write(auth_state_json)
        return local_path

    return AUTH_STATE_PATH


# ── Looker Studio スクレイピング ──────────────────────
def scrape_looker_studio(url: str) -> list[list[str]]:
    """Looker Studio のテーブルからデータを取得する。"""
    auth_state = _get_auth_state_path()
    if not os.path.exists(auth_state):
        logger.error(
            f"認証状態ファイルが見つかりません: {auth_state}\n"
            "先に login.py を実行してGoogleにログインしてください。"
        )
        return []

    logger.info(f"認証状態を読み込み: {auth_state}")
    logger.info("ブラウザを起動します")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        context = browser.new_context(
            storage_state=auth_state,
            viewport={"width": 1920, "height": 1080},
            locale="ja-JP",
        )
        page = context.new_page()

        logger.info(f"Looker Studio にアクセス: {url}")
        page.goto(url, wait_until="domcontentloaded", timeout=60000)

        # Looker Studio はレンダリングが遅いため十分に待機
        logger.info("テーブルの読み込みを待機中...")
        page.wait_for_timeout(15000)

        # 日付フィルターを変更
        _change_date_range(page, DATE_RANGE_MONTHS)

        # テーブルを末尾までスクロールして全行をレンダリングさせる
        _scroll_table_to_bottom(page)

        # ページ全体のテキストを取得
        text = page.inner_text("body")
        logger.info(f"ページテキスト取得: {len(text)} 文字")

        # テキストから正規表現でデータを抽出
        all_rows = _extract_from_text(text)

        browser.close()

    logger.info(f"合計 {len(all_rows)} 行取得しました")
    return all_rows


def _scroll_table_to_bottom(page):
    """テーブルのスクロールコンテナを末尾まで段階的にスクロールする。

    Looker Studio のテーブルは画面外の行を遅延レンダリングするため、
    スクロールして全行を表示させる必要がある。
    """
    scroll_count = page.evaluate("""
        () => {
            let scrolled = 0;
            document.querySelectorAll('div').forEach(div => {
                if (div.scrollHeight > div.clientHeight + 10 && div.clientHeight > 100) {
                    // 段階的にスクロール（一気にやると描画が追いつかない場合がある）
                    const step = div.clientHeight;
                    for (let pos = 0; pos <= div.scrollHeight; pos += step) {
                        div.scrollTop = pos;
                    }
                    div.scrollTop = div.scrollHeight;
                    scrolled++;
                }
            });
            return scrolled;
        }
    """)
    if scroll_count > 0:
        logger.info(f"テーブルを末尾までスクロール ({scroll_count} コンテナ)")
        page.wait_for_timeout(2000)  # スクロール後のレンダリング待機


def _change_date_range(page, months: int = 2):
    """Looker Studio の日付フィルターをカレンダーUI操作で変更する。

    Looker Studio はMaterial Designのカレンダーピッカーを使用しており、
    input要素ではなくカレンダーの日付ボタンを直接クリックする必要がある。
    """
    from dateutil.relativedelta import relativedelta

    today = datetime.now()
    start_date = today - relativedelta(months=months)
    logger.info(f"日付フィルターを変更: {start_date.strftime('%Y/%m/%d')} - {today.strftime('%Y/%m/%d')}")

    try:
        # 1. 日付フィルターの位置を見つけてクリック
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
        if not pos:
            logger.warning("日付フィルターが見つかりません。デフォルト期間のまま続行します。")
            return

        page.mouse.click(pos['x'], pos['y'])
        page.wait_for_timeout(3000)

        # 2. 開始日カレンダーの現在の月を読み取る
        current_month_info = page.evaluate("""
            () => {
                const startPicker = document.querySelector('.start-date-picker');
                if (!startPicker) return null;
                const btn = startPicker.querySelector('.mat-calendar-period-button');
                if (!btn) return null;
                const text = btn.textContent.trim();
                // "2026年1月" → year=2026, month=1
                const m = text.match(/(\\d{4})年(\\d{1,2})月/);
                if (!m) return null;
                return { year: parseInt(m[1]), month: parseInt(m[2]), text: text };
            }
        """)
        if not current_month_info:
            logger.warning("開始日カレンダーの月情報が取得できません")
            page.keyboard.press("Escape")
            return

        logger.info(f"開始日カレンダー現在の月: {current_month_info['text']}")

        # 3. ターゲット月まで何ヶ月戻るか計算
        current_ym = current_month_info['year'] * 12 + current_month_info['month']
        target_ym = start_date.year * 12 + start_date.month
        months_to_go_back = current_ym - target_ym

        logger.info(f"ターゲット: {start_date.year}年{start_date.month}月 → {months_to_go_back}ヶ月戻る")

        # 4. 開始日カレンダーの「前月」ボタンを必要回数クリック
        for i in range(months_to_go_back):
            clicked = page.evaluate("""
                () => {
                    const startPicker = document.querySelector('.start-date-picker');
                    if (!startPicker) return false;
                    // mat-calendar-header内のナビゲーションボタン
                    // 「前月」ボタンは mat-calendar-previous-button クラスを持つ
                    const prevBtn = startPicker.querySelector('.mat-calendar-previous-button');
                    if (prevBtn) {
                        prevBtn.click();
                        return true;
                    }
                    // フォールバック: controls内の最初のナビゲーションボタン
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
            if not clicked:
                logger.warning(f"前月ボタンのクリックに失敗 (ステップ {i+1}/{months_to_go_back})")
                page.keyboard.press("Escape")
                return
            page.wait_for_timeout(500)

        # 月が正しく遷移したか確認
        page.wait_for_timeout(500)
        new_month = page.evaluate("""
            () => {
                const startPicker = document.querySelector('.start-date-picker');
                if (!startPicker) return null;
                const btn = startPicker.querySelector('.mat-calendar-period-button');
                return btn ? btn.textContent.trim() : null;
            }
        """)
        logger.info(f"月遷移後: {new_month}")

        # 5. 開始日のターゲット日をクリック
        target_day = start_date.day
        day_clicked = page.evaluate("""
            (targetDay) => {
                const startPicker = document.querySelector('.start-date-picker');
                if (!startPicker) return false;
                // カレンダーの日付ボタンを探す
                const buttons = startPicker.querySelectorAll('.mat-calendar-body button, .mat-calendar-body-cell');
                for (const btn of buttons) {
                    const text = btn.textContent.trim();
                    if (text === String(targetDay)) {
                        btn.click();
                        return true;
                    }
                }
                return false;
            }
        """, target_day)

        if not day_clicked:
            logger.warning(f"日付 {target_day} のクリックに失敗")
            page.keyboard.press("Escape")
            return

        logger.info(f"開始日を {target_day} 日に設定")
        page.wait_for_timeout(1000)

        # 6. 「適用」ボタンをクリック
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

        if apply_clicked:
            logger.info("日付フィルター変更を適用しました。データ再読み込みを待機中...")
            page.wait_for_timeout(10000)  # テーブル再描画を待機
        else:
            logger.warning("適用ボタンが見つかりませんでした")
            page.keyboard.press("Escape")

    except Exception as e:
        logger.warning(f"日付フィルター変更に失敗: {e}。デフォルト期間のまま続行します。")


# テーブル行を抽出する正規表現
# パターン: 番号. 日付 HRBCナンバー 姓 名 email 面談予定日時 ステータス
ROW_PATTERN = re.compile(
    r'(\d+)\.\s*'                              # 行番号
    r'(\d{4}/\d{2}/\d{2})\s+'                  # 登録日時
    r'(\d+)\s+'                                # HRBCナンバー
    r'(\S+)\s+'                                # 姓
    r'(\S+)\s+'                                # 名
    r'(\S+@\S+)\s+'                            # email
    r'([\d\-: .]+|null)\s+'                    # 面談予定日時
    r'(面談済み|未面談|面談未確定)'               # 面談実施のご状況
)


def _extract_from_text(text: str) -> list[list[str]]:
    """ページテキストから正規表現でテーブルデータを抽出する。"""
    matches = ROW_PATTERN.findall(text)

    if not matches:
        logger.warning("正規表現でデータが見つかりませんでした")
        return []

    # 姓(3), 名(4), 面談予定日時(6), 面談実施のご状況(7) を抽出
    rows = []
    for m in matches:
        rows.append([m[3], m[4], m[6], m[7]])

    return rows


# ── Google Sheets 書き込み（蓄積＋更新方式） ─────────────
def write_to_sheets(data: list[list[str]]):
    """Google Sheets にデータを蓄積・更新書き込みする。

    - Looker Studioにある行 → 最新データで更新
    - Looker Studioにない古い行 → そのまま保持
    - 新規の行 → 末尾に追加
    重複判定キー: 姓 + 名 + 面談予定日時
    """
    creds = _get_credentials()
    gc = gspread.authorize(creds)

    if SPREADSHEET_ID:
        spreadsheet = gc.open_by_key(SPREADSHEET_ID)
        logger.info(f"既存スプレッドシートを開きました: {SPREADSHEET_ID}")
    else:
        spreadsheet = gc.create(f"HADO様_面談データ_{datetime.now():%Y%m%d}")
        logger.info(f"新規スプレッドシート作成: {spreadsheet.url}")

    # シートを取得 or 作成
    try:
        sheet = spreadsheet.worksheet(SHEET_NAME)
    except gspread.exceptions.WorksheetNotFound:
        sheet = spreadsheet.add_worksheet(title=SHEET_NAME, rows=1000, cols=10)

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")

    # 既存データを読み取る
    existing_values = sheet.get_all_values()

    if len(existing_values) <= 1:
        # シートが空 or ヘッダーのみ → 初回書き込み
        logger.info("シートが空のため、全データを書き込みます")
        header = HEADER_ROW + ["最終更新"]
        rows = [header] + [row + [now_str] for row in data]
        sheet.clear()
        sheet.update(range_name="A1", values=rows)
        logger.info(f"スプレッドシートに {len(data)} 行書き込みました（初回）")
    else:
        # 既存データを辞書化（キー: 姓+名+面談予定日時 → 行データ）
        # 順序を保持しつつ重複を排除
        existing_dict = {}
        existing_order = []
        for row in existing_values[1:]:  # ヘッダー行をスキップ
            if len(row) >= 3:
                key = f"{row[0]}|{row[1]}|{row[2]}"
                if key not in existing_dict:
                    existing_order.append(key)
                existing_dict[key] = row

        logger.info(f"既存データ: {len(existing_dict)} 件")

        # Looker Studioの最新データでマージ
        updated_count = 0
        new_count = 0
        new_keys = []

        for row in data:
            key = f"{row[0]}|{row[1]}|{row[2]}"
            new_row = row + [now_str]
            if key in existing_dict:
                # 既存行を最新データで更新
                existing_dict[key] = new_row
                updated_count += 1
            else:
                # 新規行を追加
                existing_dict[key] = new_row
                new_keys.append(key)
                new_count += 1

        # 全データを再構築（既存の順序を維持 + 新規を末尾に追加）
        header = HEADER_ROW + ["最終更新"]
        all_rows = [header]
        for key in existing_order:
            all_rows.append(existing_dict[key])
        for key in new_keys:
            all_rows.append(existing_dict[key])

        sheet.clear()
        sheet.update(range_name="A1", values=all_rows)
        logger.info(f"更新 {updated_count} 件 / 新規追加 {new_count} 件 / 合計 {len(all_rows) - 1} 件")

    logger.info(f"URL: {spreadsheet.url}")
    return spreadsheet.url


def _get_credentials() -> Credentials:
    """サービスアカウントの認証情報を取得する。"""
    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
    ]

    # 環境変数にJSON文字列がある場合（Cloud Run用）
    sa_json = os.environ.get("SERVICE_ACCOUNT_KEY_JSON")
    if sa_json:
        info = json.loads(sa_json)
        return Credentials.from_service_account_info(info, scopes=scopes)

    # ファイルから読み込み（ローカル用）
    return Credentials.from_service_account_file(SERVICE_ACCOUNT_JSON, scopes=scopes)


# ── エントリーポイント ────────────────────────────────
def main():
    logger.info("=== Looker Studio → Sheets 転記開始 ===")

    # 1. Looker Studio からデータ取得
    data = scrape_looker_studio(LOOKER_STUDIO_URL)

    if not data:
        logger.error("データが取得できませんでした。終了します。")
        return

    # 2. スプレッドシートに書き込み
    url = write_to_sheets(data)

    logger.info(f"=== 完了: {url} ===")


# Cloud Run Jobs はモジュール実行で呼ばれる
if __name__ == "__main__":
    main()
