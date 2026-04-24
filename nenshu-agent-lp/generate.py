"""
LP画像をgpt-image-1で生成するスクリプト。
使い方:
  python generate.py fv           # FVだけ生成
  python generate.py all          # 全セクション生成
  python generate.py <section_id> # 個別セクション生成
"""
import base64
import os
import sys
import time
from pathlib import Path
from urllib.request import Request, urlopen
import json

API_KEY = os.environ.get("OPENAI_API_KEY")
if not API_KEY:
    sys.exit("OPENAI_API_KEY not set")

OUT_DIR = Path(__file__).parent / "images"
OUT_DIR.mkdir(exist_ok=True)

COMMON_STYLE = (
    "Mobile landing page section image, vertical portrait orientation, "
    "Japanese business LP design, clean modern flat illustration style, "
    "brand color dark green (#2E7D4F) as primary with white background and gold accent, "
    "professional but approachable tone for 20s Japanese office worker audience, "
    "high readability, large bold Japanese typography where text is included, "
    "NO English text, Japanese text only, no typos, "
    "rounded UI shapes, soft shadows, business-trust atmosphere."
)

LOGO_BASE_COMMON = (
    " The text 「エージェントコンシェルジュ」 in bold modern Japanese sans-serif font, "
    "right-aligned next to the icon, dark charcoal color (#1F2937). "
    "Below the Japanese text, in smaller letter-spaced uppercase: 「AGENT CONCIERGE」 in the brand green color. "
    "Flat vector style, no gradient, no drop shadow, clean minimalist SaaS-style brand mark. "
    "Brand palette: forest green (#2E7D4F) as primary, warm gold (#D4A84B) as single accent. "
    "No typos, accurate Japanese text rendering. Generous padding around the mark."
)

LOGOS = {
    "logo_b1_twoHeads_arrow": {
        "label": "B1: 二人の頭＋連結アロー",
        "size": "1024x1024",
        "prompt": (
            "Logo design on pure white background. "
            "Left icon: two simplified human figures (one candidate, one agent) shown as two filled dots/heads, "
            "connected below by a smooth green arrow forming a subtle infinity-like loop, "
            "gold dot accent on the agent's head."
            + LOGO_BASE_COMMON
        ),
    },
    "logo_b2_interlocking_circles": {
        "label": "B2: 2つの輪が重なるマッチングマーク",
        "size": "1024x1024",
        "prompt": (
            "Logo design on pure white background. "
            "Left icon: two interlocking circles (like a venn diagram) — one solid forest green, "
            "one outlined. The overlapping area is filled with warm gold, symbolizing the perfect match "
            "between a candidate and the right agent. Clean geometric shape."
            + LOGO_BASE_COMMON
        ),
    },
    "logo_b3_network_nodes": {
        "label": "B3: 100社から1社へのネットワーク",
        "size": "1024x1024",
        "prompt": (
            "Logo design on pure white background. "
            "Left icon: a constellation of about 12 small green dots scattered around a central "
            "larger gold dot, with thin connecting lines converging inward — symbolizing 'from 100 agents to the perfect 1'. "
            "Minimalist vector style."
            + LOGO_BASE_COMMON
        ),
    },
    "logo_b4_bridge": {
        "label": "B4: 人と人を橋でつなぐ",
        "size": "1024x1024",
        "prompt": (
            "Logo design on pure white background. "
            "Left icon: two simplified human silhouette shoulders-up (one green, one gold), "
            "connected by an elegant bridge arc shape between them, symbolizing a concierge bridging candidate and agent. "
            "Flat, clean, symmetric."
            + LOGO_BASE_COMMON
        ),
    },
    "logo_b5_puzzle_match": {
        "label": "B5: パズルのピースがハマるマッチング",
        "size": "1024x1024",
        "prompt": (
            "Logo design on pure white background. "
            "Left icon: two rounded puzzle pieces fitting together — one solid forest green, "
            "one filled with warm gold — symbolizing the perfect match between candidate and agent. "
            "Soft rounded corners, modern flat design."
            + LOGO_BASE_COMMON
        ),
    },
    "logo_a_bell": {
        "label": "ロゴA: コンシェルジュベル",
        "size": "1024x1024",
        "prompt": (
            "Logo design on pure white background. "
            "Service name: 「エージェントコンシェルジュ」. "
            "Left side: a clean flat icon of a classic concierge bell (hotel reception bell) "
            "in dark forest green (#2E7D4F) with a subtle gold accent on top. "
            "Right side: the text 「エージェントコンシェルジュ」 in bold modern Japanese sans-serif font, "
            "single line, dark charcoal color (#222). "
            "Below the main text in smaller gray letters: tagline 「100社から、あなたに合う1社を。」. "
            "Minimalist, business-trust feel, suitable for a recruitment service website header. "
            "No typos, accurate Japanese text, flat vector style, no gradient, no shadow, no background texture."
        ),
    },
    "logo_b_handshake": {
        "label": "ロゴB: マッチング（握手・人とエージェントをつなぐ）",
        "size": "1024x1024",
        "prompt": (
            "Logo design on pure white background. "
            "Service name: 「エージェントコンシェルジュ」. "
            "Left side: a simple flat icon showing two abstract circle heads connected by a green ribbon or arrow, "
            "symbolizing matching a candidate with the perfect agent. "
            "Main color: dark forest green (#2E7D4F), with one gold/yellow accent dot. "
            "Right side: the text 「エージェントコンシェルジュ」 in bold modern Japanese sans-serif font. "
            "Below in smaller text: 「AGENT CONCIERGE」 in uppercase English as a secondary mark. "
            "Minimalist flat vector, clean recruitment-service brand identity, no typos, accurate Japanese text."
        ),
    },
    "logo_c_crown": {
        "label": "ロゴC: コンシェルジュ帽＋チェック",
        "size": "1024x1024",
        "prompt": (
            "Logo design on pure white background. "
            "Service name: 「エージェントコンシェルジュ」. "
            "Icon on top (centered): a stylized concierge cap with a green check mark inside, "
            "flat vector style, dark forest green (#2E7D4F) primary with gold (#D4A84B) trim. "
            "Below the icon: the service name 「エージェントコンシェルジュ」 in bold modern Japanese sans-serif, "
            "centered, dark charcoal. "
            "Below in small letters: 「AGENT CONCIERGE」. "
            "Premium, trustworthy, minimalist emblem style logo, suitable for both web header and favicon."
        ),
    },
}

SECTIONS = {
    "01_fv": {
        "label": "ファーストビュー",
        "prompt": (
            "Hero section of a Japanese recruitment LP for 20s mid-career workers. "
            "Top-left: small Venn-diagram logo mark (two interlocking circles, one forest green filled and one outlined, "
            "with gold overlap area) next to the service name 「エージェントコンシェルジュ」 in compact bold black Japanese text. "
            "Center headline in huge bold Japanese text stacked on two lines: "
            "「年収アップ転職は、」「エージェント選びで9割決まる。」 "
            "The phrase 「エージェント選び」 and 「9割」 are highlighted with a bright green underline/marker effect. "
            "Subtext below: 「提携エージェント100社以上。丁寧なカウンセリングで、あなたに合う1〜3社だけをご紹介します。」 "
            "To the right: a smiling young Japanese businessman in his late 20s wearing a navy suit, looking at his smartphone, clean modern illustration. "
            "Below the headline, three circular badges horizontally aligned: "
            "「提携エージェント100社以上」 / 「非公開ホワイト求人多数」 / 「利用料完全無料」. "
            "A big green CTA button at the bottom saying 「無料カウンセリングを予約する」. "
            "Below the button small text 「30秒で申込完了」."
        ),
    },
    "02_nayami": {
        "label": "こんなお悩みありませんか",
        "prompt": (
            "LP section titled 「こんなお悩みはありませんか？」 in bold at top. "
            "Four concern bubbles with illustrated 20s Japanese office workers (mix of men and women) with thinking/worried expressions. "
            "Bubble 1: 「このまま今の年収で、30代を迎えていいのか」 "
            "Bubble 2: 「転職サイトを見ても、年収アップできる求人が見つからない」 "
            "Bubble 3: 「エージェントに登録したら、興味のない求人ばかり紹介された」 "
            "Bubble 4: 「ブラック企業だけは絶対に避けたい」 "
            "Bottom closing line in bold: 「転職したくても、踏み出せない…」"
        ),
    },
    "03_data": {
        "label": "20代の現実データ",
        "prompt": (
            "LP section titled 「20代の転職、実はこんな現実があります」. "
            "Two large stat cards side by side: "
            "Card 1 big number: 「約400万円」 caption 「20代後半の年収中央値」. "
            "Card 2 big number with percentage donut chart: 「約6割」 caption 「転職で年収アップした人」. "
            "Bottom text: 「正しいエージェント選びができれば、あなたの年収も上がる可能性があります」. "
            "Clean infographic style, green and gold color palette."
        ),
    },
    "04_problem": {
        "label": "なぜ年収が上がらないか",
        "prompt": (
            "LP section titled 「なぜ、転職で年収が上がらないのか？」. "
            "Three red-cross bullet points stacked vertically with icons: "
            "1) 「大手転職サイトだけでは、公開求人しか見えない」 "
            "2) 「1社のエージェントだけでは、そのエージェントの持ち駒で終わる」 "
            "3) 「合わないエージェントに当たると、興味のない求人ばかり紹介される」. "
            "At the bottom, a highlighted green callout box saying: "
            "「だから年収アップ転職は、『どのエージェントと組むか』で9割決まる。」"
        ),
    },
    "05_solution": {
        "label": "サービス紹介",
        "prompt": (
            "LP section. Top small text: 「その問題を解決するのが」. "
            "Below it, a large Venn-diagram logo mark (two interlocking circles — one forest green filled, one outlined, "
            "gold overlap area) next to the service name 「エージェントコンシェルジュ」 in bold Japanese sans-serif. "
            "Below the logo, body text: 「提携エージェント100社以上のネットワークから、"
            "あなたの希望にマッチし、年収アップ実績のあるエージェントだけを、"
            "丁寧なカウンセリングを通じてご紹介します。」 "
            "Illustration of a friendly Japanese career counselor pointing upward with a confident smile. "
            "Soft green background with confetti/sparkle accents."
        ),
    },
    "06_reasons": {
        "label": "選ばれる3つの理由",
        "prompt": (
            "LP section titled 「選ばれる3つの理由」. Three vertically stacked cards with distinct icons: "
            "Card 1 icon = network graph. Title 「提携エージェント100社以上」. Body 「総合型から業界特化型まで網羅。非公開ホワイト求人にアクセス可能。」 "
            "Card 2 icon = speech bubble with heart. Title 「丁寧なカウンセリング」. Body 「30〜45分のじっくりヒアリング。希望・価値観・キャリアを棚卸ししてから紹介。」 "
            "Card 3 icon = free/price tag. Title 「完全無料・押し売りなし」. Body 「ご紹介後も自由に選択可能。合わなければ別のエージェントに変更できます。」 "
            "Modern card UI, green accent color."
        ),
    },
    "07_white": {
        "label": "ホワイト求人基準",
        "prompt": (
            "LP section titled 「『ホワイト求人』の基準、明確にしています」. "
            "Four check-mark bullet items in a clean list: "
            "✓ 「年間休日120日以上」 "
            "✓ 「平均残業時間 月20時間以下」 "
            "✓ 「離職率 10%以下」 "
            "✓ 「年収レンジ 450万円以上」 "
            "Bottom line: 「この基準をクリアした求人を、厳選してご紹介します。」 "
            "Illustration of a shiny office building with a white/green shield badge."
        ),
    },
    "08_counseling": {
        "label": "丁寧なカウンセリング",
        "prompt": (
            "LP section titled 「『紹介する前』の、丁寧なカウンセリング」. "
            "Central illustration: a Japanese career counselor having an online video call with a young professional, laptop on desk, warm lighting. "
            "Side list of hearing topics with check icons: "
            "・現職の不満・モヤモヤ "
            "・希望年収・働き方 "
            "・5年後のキャリア像 "
            "・NG条件（業界・勤務地・残業など） "
            "Bottom quote: 「診断ツールでは拾いきれない、あなたの本音を引き出します。"
            "だから『ミスマッチなエージェント紹介』が起きません。」"
        ),
    },
    "09_compare": {
        "label": "他手段との比較表",
        "prompt": (
            "LP section titled 「他の方法と、何が違う？」. "
            "Comparison table with 3 columns: 「転職サイト」 / 「1社のエージェント」 / 「当サービス」. "
            "Rows: 求人数 / 非公開求人 / カウンセリング / ミスマッチ / 費用. "
            "Fill cells with ○△×◎ marks. The 当サービス column is highlighted in green with all ◎ marks (except cost which is 無料). "
            "Clean table UI, mobile-friendly."
        ),
    },
    "10_steps": {
        "label": "5STEP利用の流れ",
        "prompt": (
            "LP section titled 「カンタン5STEP」 subtitle 「カウンセリングの流れ」. "
            "Five vertically stacked step cards, each with a green rounded header saying STEP 1 through STEP 5: "
            "STEP1: 「60秒の申込フォームに回答」 with form icon illustration. "
            "STEP2: 「LINE友だち登録」 with LINE phone illustration. "
            "STEP3: 「カウンセリング日程を予約」 with calendar illustration. "
            "STEP4: 「オンラインで30〜45分のカウンセリング」 with video call illustration. "
            "STEP5: 「あなたに合うエージェント1〜3社をご紹介」 with person handshake illustration."
        ),
    },
    "11_voice": {
        "label": "利用者の声",
        "prompt": (
            "LP section titled 「ご利用者の声」. "
            "Two testimonial cards stacked vertically. "
            "Card 1: photo-style avatar of a 28-year-old Japanese male sales professional, "
            "headline 「28歳・営業職 / 年収420万→560万」, "
            "quote body 「自分では見つけられなかったホワイト求人を紹介してもらえました。カウンセリングで希望が整理できたのが大きかったです。」. "
            "Card 2: avatar of a 26-year-old Japanese female engineer, "
            "headline 「26歳・エンジニア / ブラック企業からホワイト大手へ」, "
            "quote body 「1社のエージェントでは出会えなかった非公開求人に出会えて、働き方が一変しました。」. "
            "Clean testimonial card UI."
        ),
    },
    "12_faq": {
        "label": "よくある質問",
        "prompt": (
            "LP section titled 「よくある質問」 FAQ. "
            "Six question cards vertically stacked, each with a green Q circle icon. "
            "Q1: 「本当に無料で利用できますか？」 "
            "Q2: 「今すぐ転職する予定がなくても大丈夫？」 "
            "Q3: 「紹介されたエージェントが合わなかったら？」 "
            "Q4: 「カウンセラーはどんな人ですか？」 "
            "Q5: 「個人情報の扱いは？」 "
            "Q6: 「どれくらいの期間で転職できますか？」 "
            "Each question with brief A answer in 1-2 lines underneath."
        ),
    },
    "13_cta": {
        "label": "最終CTA",
        "prompt": (
            "Final CTA section. "
            "Large headline: 「その転職、エージェント選びから変えませんか？」 "
            "Sub: 「提携100社から、あなたに合う1社を。」 "
            "A huge green rounded CTA button: 「無料カウンセリングを予約する」. "
            "Below small text: 「30秒で申込完了・利用料完全無料」. "
            "Background with soft green gradient and confident smiling young Japanese professionals in the background."
        ),
    },
}


def generate(section_id: str):
    if section_id in LOGOS:
        spec = LOGOS[section_id]
        prompt = spec["prompt"]
        size = spec.get("size", "1024x1024")
    elif section_id in SECTIONS:
        spec = SECTIONS[section_id]
        prompt = spec["prompt"] + "\n\nSTYLE: " + COMMON_STYLE
        size = "1024x1536"
    else:
        sys.exit(f"unknown section: {section_id}")
    print(f"[{section_id}] {spec['label']} ... generating")

    body = json.dumps({
        "model": "gpt-image-2",
        "prompt": prompt,
        "size": size,
        "quality": "high",
        "n": 1,
    }).encode()

    req = Request(
        "https://api.openai.com/v1/images/generations",
        data=body,
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    t0 = time.time()
    with urlopen(req, timeout=300) as resp:
        data = json.loads(resp.read())
    dt = time.time() - t0

    b64 = data["data"][0]["b64_json"]
    out = OUT_DIR / f"{section_id}.png"
    out.write_bytes(base64.b64decode(b64))
    print(f"[{section_id}] saved -> {out} ({dt:.1f}s, {out.stat().st_size // 1024}KB)")


def main():
    if len(sys.argv) < 2:
        sys.exit("usage: python generate.py <fv|all|section_id>")
    target = sys.argv[1]
    if target == "fv":
        generate("01_fv")
    elif target == "all":
        for sid in SECTIONS:
            generate(sid)
    elif target == "group1":
        for sid in ["01_fv", "02_nayami", "03_data", "04_problem", "05_solution"]:
            generate(sid)
    elif target == "group2":
        for sid in ["06_reasons", "07_white", "08_counseling", "09_compare"]:
            generate(sid)
    elif target == "group3":
        for sid in ["10_steps", "11_voice", "12_faq", "13_cta"]:
            generate(sid)
    elif target == "logos":
        for sid in LOGOS:
            generate(sid)
    elif target == "logos_b":
        for sid in LOGOS:
            if sid.startswith("logo_b"):
                generate(sid)
    else:
        generate(target)


if __name__ == "__main__":
    main()
