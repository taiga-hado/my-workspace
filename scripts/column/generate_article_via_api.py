#!/usr/bin/env python3
"""
求職者送客の窓口 - Anthropic API を使って記事 JSON を自動生成
====================================================================

入力:
  - queue.json の先頭エントリ (slug/title/description/keywords/category/image_prompt/key_points)
  - 既存記事 (_metadata.json) を few-shot example として参照

出力:
  - ready/{YYYY-MM-DD}.json (build_article.py が読み取る形式)

使い方:
  /usr/bin/python3 generate_article_via_api.py [YYYY-MM-DD]
    - 引数なしなら本日付
    - 引数あり (例 2026-05-29) ならその日付

モデル:
  - 環境変数 COLUMN_GEN_MODEL で切替 (default: claude-opus-4-7)
"""

from __future__ import annotations

import json
import os
import sys
import time
from datetime import date, datetime
from pathlib import Path

try:
    import anthropic
except ImportError:
    print("ERROR: anthropic SDK が見つかりません。`pip3 install anthropic` を実行してください")
    sys.exit(1)

# ----------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
QUEUE_FILE = SCRIPT_DIR / "queue.json"
READY_DIR = SCRIPT_DIR / "ready"
PUBLISHED_DIR = SCRIPT_DIR / "published"
METADATA_FILE = SCRIPT_DIR.parent.parent / "soukyaku-madoguchi" / "column" / "_metadata.json"

MODEL = os.environ.get("COLUMN_GEN_MODEL", "claude-opus-4-7")
MAX_TOKENS = int(os.environ.get("COLUMN_GEN_MAX_TOKENS", "8192"))
MAX_RETRIES = 3

# ----------------------------------------------------------------------
# Brand & few-shot constants
BRAND_CONTEXT = """\
# サービス概要
「求職者送客の窓口」は、人材紹介事業者（エージェント）向けに、
SNS集客 → 事前カウンセリング → 日程調整まで完全代行する着座成果報酬型サービス。
- 初期費用・月額費用 0円
- 面談着座1件あたりの成果報酬のみ
- 面談着座率 80〜90%
- ターゲット: 第二新卒・若手未経験・新卒 求職者
- ドメイン: https://kyusyokusyasokyaku-no-madoguchi.com/

# 読者
- 人材紹介事業の経営者・事業責任者・マーケ責任者
- 既に運営しており、CAの生産性 / 集客 / CPA / 着座率 / ROAS に課題を感じている層
- 「採用」ではなく「求職者送客」目線で読む

# 記事トーン
- 数字と相場感で語る (CPA・歩留まり・%・件数)
- フレームワークで整理 (3〜4節構成)
- 美辞麗句なし、実務目線
- セールスではなく解説。CTAは記事末尾の bridge セクションで自然に
"""

# ----------------------------------------------------------------------
def load_few_shot_examples() -> list[dict]:
    """品質基準を示すために、published から2本選んで例示"""
    examples = []
    for filename in ["2026-05-22.json", "2026-05-24.json"]:
        path = PUBLISHED_DIR / filename
        if path.exists():
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
            examples.append(data[0])
    return examples


def load_existing_slugs() -> list[str]:
    if not METADATA_FILE.exists():
        return []
    with open(METADATA_FILE, encoding="utf-8") as f:
        data = json.load(f)
    return [a["slug"] for a in data]


def pop_queue_entry() -> dict | None:
    """queue.json の先頭を取り出して保存"""
    if not QUEUE_FILE.exists():
        return None
    with open(QUEUE_FILE, encoding="utf-8") as f:
        queue = json.load(f)
    if not queue:
        return None
    entry = queue[0]
    rest = queue[1:]
    with open(QUEUE_FILE, "w", encoding="utf-8") as f:
        json.dump(rest, f, ensure_ascii=False, indent=2)
    return entry


# ----------------------------------------------------------------------
# JSON schema for structured output (body_html + metadata)
OUTPUT_SCHEMA = {
    "type": "object",
    "properties": {
        "body_html": {
            "type": "string",
            "description": (
                "記事本文の HTML。先頭は <div class=\"art-lead\"> でリード文 (p 2本)、"
                "次に <nav class=\"art-toc\"><h3>目次</h3><ol><li><a href=\"#xxx\">...</a></li>...</ol></nav>、"
                "その後 <h2 id=\"xxx\"> セクション 3〜4 本。各セクションは <p> と <ul><li> を組み合わせ、"
                "重要部分は <strong> で強調。1〜2 箇所に <div class=\"art-callout\"><p>...</p></div> で補足。"
                "全体で 2200〜3500 文字程度。Markdown は使わず純粋な HTML のみ。"
                "外側を囲む <article> や <main> タグは不要 (build_article.py が囲む)。"
            ),
        },
        "summary": {
            "type": "array",
            "description": "記事冒頭に表示する要点 (ちょうど 4 個)。各 60〜100 文字。具体的な数字や%を含める。配列の長さは必ず 4。",
            "items": {"type": "string"},
        },
        "bridge_title": {
            "type": "string",
            "description": "CTA セクション (求職者送客の窓口への導線) の見出し。「〜したい場合」「〜の方へ」など。",
        },
        "bridge": {
            "type": "array",
            "description": (
                "CTA セクション本文 (ちょうど 2 段落)。"
                "1段落目: 記事内容を踏まえた前置き (なぜ外部化が選択肢になるか)。"
                "2段落目: 「求職者送客の窓口」の説明。<strong>初期費用0円・月額費用0円</strong> 等を含める。"
                "1段落 150〜250 文字。HTML タグ可 (主に <strong>)。配列の長さは必ず 2。"
            ),
            "items": {"type": "string"},
        },
        "read_time": {
            "type": "string",
            "description": "「9分」「10分」など。本文 2500 字 = 約 9分。",
        },
    },
    "required": ["body_html", "summary", "bridge_title", "bridge", "read_time"],
    "additionalProperties": False,
}


def build_system_prompt(few_shot: list[dict]) -> list[dict]:
    """システムプロンプトを構造化 (cache_control 付き)"""
    # 例示を JSON 文字列に整形
    examples_text = ""
    for i, ex in enumerate(few_shot, 1):
        out = {
            "body_html": ex["body_html"],
            "summary": ex["summary"],
            "bridge_title": ex["bridge_title"],
            "bridge": ex["bridge"],
            "read_time": ex["read_time"],
        }
        examples_text += f"\n## 例 {i}: {ex['title']} ({ex['category']})\n"
        examples_text += "入力:\n```json\n"
        examples_text += json.dumps(
            {
                "slug": ex["slug"],
                "title": ex["title"],
                "description": ex["description"],
                "keywords": ex["keywords"],
                "category": ex["category"],
            },
            ensure_ascii=False,
            indent=2,
        )
        examples_text += "\n```\n\n出力:\n```json\n"
        examples_text += json.dumps(out, ensure_ascii=False, indent=2)
        examples_text += "\n```\n"

    system_text = f"""あなたは「求職者送客の窓口」のオウンドメディア編集者です。
人材紹介事業者向けの実務記事を執筆します。

{BRAND_CONTEXT}

# 出力フォーマット
構造化 JSON で以下を返してください:
- body_html: 記事本文の HTML (2200〜3500 字)
- summary: 4 つの要点 (各 60〜100 字)
- bridge_title: CTA セクションの見出し
- bridge: CTA セクション本文 2 段落
- read_time: 「9分」など

# 品質基準
- 数字・相場感を必ず含める (CPA, 着座率, 歩留まり, 件数, %)
- 実務で意思決定の参考になるレベルの解像度
- 「〜と言われています」「〜が大切です」のような曖昧表現は禁止
- 「面談着座率」「決定」「成果報酬」「歩留まり」など業界用語は正しく使う
- 自社サービス (求職者送客の窓口) の紹介は body_html 内では一切しない。bridge にだけ書く

# 既存記事の例 (これと同等の品質・構成で書く)
{examples_text}
"""
    return [
        {
            "type": "text",
            "text": system_text,
            "cache_control": {"type": "ephemeral"},
        }
    ]


def build_user_prompt(entry: dict, existing_slugs: list[str]) -> str:
    key_points_text = ""
    if entry.get("key_points"):
        kp = entry["key_points"]
        if isinstance(kp, list):
            key_points_text = "\n# 必ずカバーすべき論点 (h2 セクションに対応)\n"
            for p in kp:
                key_points_text += f"- {p}\n"

    avoid_text = ""
    if existing_slugs:
        avoid_text = (
            "\n# 既存記事との重複を避ける\n"
            f"以下の slug の記事は既に公開済みです。同じテーマの再執筆や、内容の被りすぎは避けてください:\n"
            + ", ".join(existing_slugs[-20:])
            + "\n"
        )

    return f"""次の記事を執筆してください。

# メタ情報
- slug: {entry['slug']}
- title: {entry['title']}
- description: {entry['description']}
- keywords: {entry['keywords']}
- category: {entry['category']}
{key_points_text}{avoid_text}

# 構成のガイド
1. リード文 (art-lead): 課題提起 + 本記事で扱う内容を 2 段落
2. 目次 (art-toc): h2 セクション 3〜4 本を ol で
3. h2 セクション 3〜4 本: 各セクションに p + ul、必要に応じて art-callout
4. 末尾の bridge は別フィールドで返す (body_html には含めない)

タイトル ({entry['title']}) を h1 で書く必要はありません。build_article.py が <h1> を挿入します。

それでは生成してください。"""


# ----------------------------------------------------------------------
def call_anthropic(entry: dict, existing_slugs: list[str], few_shot: list[dict]) -> dict:
    client = anthropic.Anthropic()
    system_blocks = build_system_prompt(few_shot)
    user_text = build_user_prompt(entry, existing_slugs)

    print(f"[generate] model={MODEL} slug={entry['slug']} title={entry['title']}")

    last_err = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.messages.create(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                thinking={"type": "adaptive"},
                system=system_blocks,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": user_text,
                            }
                        ],
                    }
                ],
                output_config={
                    "format": {
                        "type": "json_schema",
                        "schema": OUTPUT_SCHEMA,
                    }
                },
            )

            # cache hit 情報
            usage = response.usage
            cache_read = getattr(usage, "cache_read_input_tokens", 0) or 0
            cache_create = getattr(usage, "cache_creation_input_tokens", 0) or 0
            print(
                f"[generate] usage: input={usage.input_tokens} "
                f"output={usage.output_tokens} "
                f"cache_read={cache_read} cache_create={cache_create}"
            )

            # JSON 抽出 (output_config を使った時は text ブロックが JSON 文字列)
            text_parts = []
            for block in response.content:
                if block.type == "text":
                    text_parts.append(block.text)
            raw_text = "".join(text_parts).strip()
            if not raw_text:
                raise RuntimeError("LLM response had no text content")

            # JSON parse
            try:
                parsed = json.loads(raw_text)
            except json.JSONDecodeError as e:
                # 念のため ```json ... ``` をはがす
                stripped = raw_text.strip("`")
                if stripped.startswith("json"):
                    stripped = stripped[4:].strip()
                parsed = json.loads(stripped)

            # 検証
            for key in ("body_html", "summary", "bridge_title", "bridge", "read_time"):
                if key not in parsed:
                    raise RuntimeError(f"missing key: {key}")
            if len(parsed["summary"]) != 4:
                raise RuntimeError(f"summary length must be 4, got {len(parsed['summary'])}")
            if len(parsed["bridge"]) != 2:
                raise RuntimeError(f"bridge length must be 2, got {len(parsed['bridge'])}")

            return parsed

        except (anthropic.APIError, json.JSONDecodeError, RuntimeError, ConnectionError, TimeoutError, OSError) as e:
            last_err = e
            print(f"[generate attempt {attempt} failed] {type(e).__name__}: {e}")
            if attempt < MAX_RETRIES:
                time.sleep(3 * attempt)

    raise RuntimeError(f"Failed after {MAX_RETRIES} attempts: {last_err}")


# ----------------------------------------------------------------------
def build_ready_json(entry: dict, generated: dict) -> list[dict]:
    """build_article.py が期待する形式に整形"""
    article = {
        "slug": entry["slug"],
        "title": entry["title"],
        "description": entry["description"],
        "keywords": entry["keywords"],
        "category": entry["category"],
        "read_time": generated["read_time"],
        "image_prompt": entry.get(
            "image_prompt",
            f"Modern editorial illustration about {entry['slug']}. Clean flat illustration in deep navy blue (#1a3a8a) with gold (#f5b400) accent. Soft white background, premium SaaS publication aesthetic, minimalist, no text or letters in the image. Wide aspect 3:2.",
        ),
        "summary": generated["summary"],
        "bridge_title": generated["bridge_title"],
        "bridge": generated["bridge"],
        "body_html": generated["body_html"],
    }
    return [article]


def main():
    target_date = sys.argv[1] if len(sys.argv) > 1 else date.today().isoformat()
    # 日付形式の簡易チェック
    try:
        datetime.strptime(target_date, "%Y-%m-%d")
    except ValueError:
        print(f"ERROR: invalid date format: {target_date} (expected YYYY-MM-DD)")
        sys.exit(2)

    out_path = READY_DIR / f"{target_date}.json"
    if out_path.exists():
        print(f"[generate] {out_path} already exists. skip.")
        return

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("ERROR: ANTHROPIC_API_KEY が環境変数に設定されていません")
        sys.exit(1)

    entry = pop_queue_entry()
    if not entry:
        print("ERROR: queue.json が空です。generate_keyword_via_api.py で補充してください")
        sys.exit(3)

    existing_slugs = load_existing_slugs()
    few_shot = load_few_shot_examples()

    generated = call_anthropic(entry, existing_slugs, few_shot)
    ready_data = build_ready_json(entry, generated)

    READY_DIR.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(ready_data, f, ensure_ascii=False, indent=2)
    print(f"[generate] wrote {out_path}")
    print(f"[generate] slug={entry['slug']} title={entry['title']}")


if __name__ == "__main__":
    main()
