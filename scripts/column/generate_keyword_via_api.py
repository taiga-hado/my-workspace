#!/usr/bin/env python3
"""
求職者送客の窓口 - queue.json が空のときに新しいキーワード/記事案を Anthropic API で自動生成
====================================================================

入力:
  - 既存記事メタデータ (_metadata.json) を参照し、重複を避ける
  - 既存記事 (_kw_index.json) からカバー済みキーワードを把握

出力:
  - queue.json に新しいエントリ N 件を追加 (default 3)

使い方:
  /usr/bin/python3 generate_keyword_via_api.py [N]
"""

from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path

try:
    import anthropic
except ImportError:
    print("ERROR: anthropic SDK が見つかりません")
    sys.exit(1)

# ----------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
QUEUE_FILE = SCRIPT_DIR / "queue.json"
METADATA_FILE = SCRIPT_DIR.parent.parent / "soukyaku-madoguchi" / "column" / "_metadata.json"
KW_INDEX_FILE = SCRIPT_DIR.parent.parent / "soukyaku-madoguchi" / "column" / "_kw_index.json"

MODEL = os.environ.get("COLUMN_GEN_MODEL", "claude-opus-4-7")
MAX_TOKENS = 4096
MAX_RETRIES = 3

CATEGORIES = ["用語解説", "ハウツー", "課題解決", "セグメント別", "比較検討", "業界トレンド", "完全ガイド"]

# 既出 KW 軸 (重複回避)
COVERED_AXES_HINT = """\
既にカバー済み:
- セグメント別: 第二新卒、未経験、エンジニア、女性、CS、SaaS営業、30代、UIターン、大阪、東海/愛知、福岡
- ハウツー: SNS集客 (TikTok/Instagram/LINE)、リスティング広告、住宅手当訴求、LP CVR、コンテンツマーケ、広告クリエイティブ、CV計測、事前カウンセリング
- 課題解決: CPA高騰、面談着座率、ROAS改善、ファネル設計
- 比較検討: 集客代行サービス比較
- 用語解説: 着座成果報酬、CPA計算、ビジネスモデル、許認可
- 業界トレンド: 新卒紹介トレンド、新卒母集団形成
- 完全ガイド: 求職者集客の完全ガイド (ピラー)

# 開拓余地のあるテーマ例
- Indeed・求人検索エンジン経由の集客
- リファラル / 紹介経由集客
- YouTube / 動画コンテンツ
- 採用ピッチ資料 / 求人原稿改善
- リテンション / 候補者DB活用 / 再アプローチ
- 個人情報保護法 (求職者DB) / GDPR / 反社チェック
- マーケティングオートメーション
- 求職者属性別 (30代/40代/管理職/外国人/シニア)
- 業種別 (医療/介護/IT/物流/小売/飲食)
- 海外人材紹介 / 外国人材
- AIエージェント活用 / GPT 活用
- ITP / Cookie 規制への対応
- 求人広告 vs 人材紹介 の使い分け
- 求人媒体の選び方 (リクナビ・doda・マイナビ等の比較)
- 採用ターゲット設計 / ペルソナ設計
- 内定承諾率 / オファー設計
- 紹介手数料の相場 / 報酬体系設計
- 紹介会社 KPI / ダッシュボード設計
- 求職者ロイヤリティ / NPS
"""


# ----------------------------------------------------------------------
def load_existing() -> tuple[list[str], list[str], list[str]]:
    slugs, titles, keywords = [], [], []
    if METADATA_FILE.exists():
        with open(METADATA_FILE, encoding="utf-8") as f:
            data = json.load(f)
        for a in data:
            slugs.append(a["slug"])
            titles.append(a.get("title", ""))
            if a.get("keywords"):
                keywords.extend([k.strip() for k in a["keywords"].split(",")])
    return slugs, titles, sorted(set(keywords))


def load_queue() -> list[dict]:
    if not QUEUE_FILE.exists():
        return []
    with open(QUEUE_FILE, encoding="utf-8") as f:
        return json.load(f)


def save_queue(queue: list[dict]):
    with open(QUEUE_FILE, "w", encoding="utf-8") as f:
        json.dump(queue, f, ensure_ascii=False, indent=2)


# ----------------------------------------------------------------------
KW_SCHEMA = {
    "type": "object",
    "properties": {
        "entries": {
            "type": "array",
            "description": "新しい記事案。各要素は queue.json の 1 エントリ。順序は重要度・SEO 流入見込み順。",
            "items": {
                "type": "object",
                "properties": {
                    "slug": {
                        "type": "string",
                        "description": "URL の slug。kebab-case。recruitment- や seat- などの既存接頭辞に揃える。",
                    },
                    "title": {
                        "type": "string",
                        "description": "記事タイトル。30〜45 文字。｜ や ｜【】 で副題を分けて良い。",
                    },
                    "description": {
                        "type": "string",
                        "description": "meta description 用。70〜120 文字。",
                    },
                    "keywords": {
                        "type": "string",
                        "description": "カンマ区切りで 3〜5 個。SEO ターゲット KW を実際の検索クエリで。",
                    },
                    "category": {
                        "type": "string",
                        "description": "カテゴリ。次のいずれか: 用語解説 / ハウツー / 課題解決 / セグメント別 / 比較検討 / 業界トレンド / 完全ガイド",
                    },
                    "image_prompt": {
                        "type": "string",
                        "description": (
                            "OpenAI gpt-image-2 用の英語プロンプト。"
                            "deep navy blue (#1a3a8a) + gold (#f5b400) accent, "
                            "flat editorial illustration, premium SaaS aesthetic, "
                            "soft white background, no text or letters, 3:2 aspect の方針で。"
                        ),
                    },
                    "key_points": {
                        "type": "array",
                        "description": "記事の h2 セクションに対応する論点 4 つ。",
                        "items": {"type": "string"},
                    },
                },
                "required": ["slug", "title", "description", "keywords", "category", "image_prompt", "key_points"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["entries"],
    "additionalProperties": False,
}


def build_system_prompt() -> list[dict]:
    text = f"""あなたは「求職者送客の窓口」(https://kyusyokusyasokyaku-no-madoguchi.com/) のオウンドメディア編集長です。
人材紹介事業者 (エージェント) 向け SEO 記事の選定を担当します。

# サービス前提
求職者送客サービス。SNS集客→事前カウンセリング→面談着座まで代行。着座成果報酬。
ターゲット読者: 人材紹介事業の経営者・マーケ責任者。
記事 KPI: 「求職者集客」「人材紹介 集客」「CPA」「面談着座」等での自然流入。

# あなたの仕事
queue.json に追加する新しい記事案を出してください。
重要視するのは:
1. **SEO ボリュームと CV 関連性のバランス** (検索ボリュームが小さくても、CV につながる KW を優先)
2. **既存記事と重複しない** こと (slug・テーマ・主要 KW の重複を避ける)
3. **「求職者送客の窓口」サービスが解決できる課題に紐づく** こと
4. **カテゴリの偏りを抑える** (ハウツーに偏らないよう、用語解説・比較検討等もバランス良く)

# カテゴリ定義
- 用語解説: 業界用語の定義 (CPA, ROAS, 着座成果報酬, 許認可 等)
- ハウツー: 具体的な施策の進め方 (リスティング広告の出し方 等)
- 課題解決: 「〜の課題を解決する」型 (CPA高騰、面談着座率改善 等)
- セグメント別: 求職者属性 or 地域別 (30代向け、関西エリア 等)
- 比較検討: 複数選択肢の比較 (媒体比較、サービス比較)
- 業界トレンド: 市場動向 (新卒紹介トレンド、AI活用動向)
- 完全ガイド: ピラー記事 (5000字+、内部リンクハブ)

{COVERED_AXES_HINT}
"""
    return [
        {
            "type": "text",
            "text": text,
            "cache_control": {"type": "ephemeral"},
        }
    ]


def build_user_prompt(slugs: list[str], titles: list[str], keywords: list[str], n: int) -> str:
    existing_text = "\n".join(f"- {s}: {t}" for s, t in zip(slugs, titles))
    kw_text = "、".join(keywords[:80]) if keywords else "(なし)"

    return f"""新しい記事案を {n} 件、queue.json 形式で生成してください。

# 既存記事 (重複禁止)
{existing_text}

# 既出キーワード (重複禁止)
{kw_text}

# 出力フォーマット
entries 配列に {n} 件。各要素は queue.json の 1 エントリ:
- slug (例: recruitment-foo-bar)
- title (30〜45 字)
- description (70〜120 字)
- keywords (カンマ区切り 3〜5 個)
- category (用語解説/ハウツー/課題解決/セグメント別/比較検討/業界トレンド/完全ガイド のいずれか)
- image_prompt (英語、3:2、navy+gold、no text)
- key_points (4 個。h2 セクション対応)

順序は重要度順 (CV 寄与 × 流入見込み)。
"""


def call_anthropic(slugs, titles, keywords, n) -> dict:
    client = anthropic.Anthropic()
    system_blocks = build_system_prompt()
    user_text = build_user_prompt(slugs, titles, keywords, n)

    print(f"[keyword] model={MODEL} n={n}")
    last_err = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.messages.create(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                thinking={"type": "adaptive"},
                system=system_blocks,
                messages=[{"role": "user", "content": [{"type": "text", "text": user_text}]}],
                output_config={
                    "format": {
                        "type": "json_schema",
                        "schema": KW_SCHEMA,
                    }
                },
            )
            usage = response.usage
            print(f"[keyword] usage: in={usage.input_tokens} out={usage.output_tokens}")

            text_parts = [b.text for b in response.content if b.type == "text"]
            raw = "".join(text_parts).strip()
            if raw.startswith("```"):
                raw = raw.strip("`")
                if raw.startswith("json"):
                    raw = raw[4:].strip()
            parsed = json.loads(raw)
            entries = parsed.get("entries", [])
            if not entries:
                raise RuntimeError("no entries returned")

            # 既存 slug と被ったら除外
            existing_set = set(slugs)
            filtered = [e for e in entries if e["slug"] not in existing_set]
            if not filtered:
                raise RuntimeError("all entries duplicated existing slugs")
            return {"entries": filtered}
        except (anthropic.APIError, json.JSONDecodeError, RuntimeError, ConnectionError, TimeoutError, OSError) as e:
            last_err = e
            print(f"[keyword attempt {attempt}] {type(e).__name__}: {e}")
            if attempt < MAX_RETRIES:
                time.sleep(3 * attempt)
    raise RuntimeError(f"keyword gen failed: {last_err}")


def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 3

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("ERROR: ANTHROPIC_API_KEY 未設定")
        sys.exit(1)

    slugs, titles, keywords = load_existing()
    print(f"[keyword] existing slugs: {len(slugs)}, keywords: {len(keywords)}")

    queue = load_queue()
    print(f"[keyword] current queue size: {len(queue)}")

    result = call_anthropic(slugs, titles, keywords, n)
    new_entries = result["entries"]
    print(f"[keyword] adding {len(new_entries)} entries:")
    for e in new_entries:
        print(f"  - {e['slug']} [{e['category']}]: {e['title']}")

    queue.extend(new_entries)
    save_queue(queue)
    print(f"[keyword] queue size after: {len(queue)}")


if __name__ == "__main__":
    main()
