"""
ハックツ就職LP画像生成スクリプト (gpt-image-2)
v2: 写真×イラストのミックス、信頼感強化、サービス名「ハックツ就職」をそのまま入れる
"""
import base64
import os
import sys
import time
import json
from pathlib import Path
from urllib.request import Request, urlopen

API_KEY = os.environ.get("OPENAI_API_KEY")
if not API_KEY:
    sys.exit("OPENAI_API_KEY not set")

OUT_DIR = Path(__file__).parent / "images"
OUT_DIR.mkdir(exist_ok=True)

BRAND_STYLE = (
    "Mobile landing page section image, vertical portrait orientation. "
    "Japanese professional recruitment service LP for 20s first-time job seekers "
    "(フリーター・ニート・未経験). "
    "Brand palette: deep trustworthy green (#2F9A56) as primary, "
    "muted gold/yellow (#E8B94E) for accents (NOT neon), "
    "warm brick orange (#D97742) for call-outs, clean white (#FFFFFF) background, "
    "dark charcoal (#1F2937) for primary text. "
    "TRUST-FIRST design: feel more like a corporate recruitment agency than a cartoon service. "
    "Typography: bold modern Japanese sans-serif, clean spacing. "
    "Soft drop shadows, subtle rounded corners (not cartoonish), thin border accents. "
    "IMPORTANT: No logo mark, no LINE CTA button, no placeholder button rectangle in the image. "
    "No typos, accurate Japanese text rendering."
)

PHOTO_STYLE = (
    "Use photo-realistic / stock-photo style imagery for people and places "
    "(real Japanese people, real offices, real apparel stores) rather than flat cartoon illustrations. "
    "Photos should feel like professional recruitment site photography: natural lighting, slight warmth, "
    "genuine expressions, business-casual attire. 20s Japanese cast, diverse gender mix."
)

ILLUSTRATION_STYLE = (
    "Use clean, semi-realistic editorial illustration — NOT childish cartoon. "
    "Thin line style with restrained color fills, natural proportions, "
    "approachable but mature (think modern business infographic, not a children's book)."
)

SECTIONS = {
    "01_fv": {
        "label": "FV: 隠れホワイト企業へ（信頼感強化）",
        "style": PHOTO_STYLE,
        "prompt": (
            "Hero section. The TOP 70px is completely blank white (room for the service logo). "
            "Below that, a narrow yellow pill badge aligned right: 「未経験専門就職サービス」 in dark text. "
            "Three small tag labels in a row: 「#フリーター」「#スキルゼロ」「でも…」 in muted green. "
            "Central massive headline stacked in two lines: "
            "「隠れホワイト」「企業へ」 — 「ホワイト」 in huge outlined-bold white text filled with crisp green "
            "so it pops from the background, 「隠れ」 and 「企業へ」 in dark charcoal. "
            "Below headline a clean subline: 「未経験転職は、エージェント選びで9割決まる。」 "
            "in neutral grey, 「9割」 emphasized. "
            "To the right: PHOTO-REALISTIC portrait of a confident 20s Japanese man in a neat navy suit, "
            "mild smile (not jumping, not cartoon — a professional head-and-shoulders photo-style rendering "
            "against a soft bokeh modern office window). "
            "Below the portrait, a clean horizontal row of three condition pill badges in brick-orange background + yellow highlight: "
            "「年収500万円以上」「土日祝休み」「残業なし」. "
            "Under the pills, a small trusted-seal badge: gold medallion with 「ホワイト求人数 No.1」 "
            "and grey footnote 「※2025年度当社実績調べ」. "
            "Bottom 120px is completely blank white space (room for the CTA button — do NOT draw any button). "
            "Overall: professional, trustworthy, premium feel."
        ),
    },
    "02_success": {
        "label": "成功事例: 160万UP（写真ベース）",
        "style": PHOTO_STYLE,
        "prompt": (
            "Trust-oriented results section. Top headline: 「未経験でも、成功者が続出」 with underline-style yellow highlight under 「成功者」. "
            "Two stacked testimonial cards with clean white background and soft shadow: "
            "Card 1: left side photo-realistic portrait of a smiling 24-year-old Japanese woman in business casual at a reception desk "
            "(warm indoor lighting, real-photo feel). "
            "Right side label set: green tag 「Iさん・24歳女性」, bold title 「フリーター → 受付事務職」, "
            "and a clean before-after bar chart — grey bar 「転職前 飲食店 220万円」 vs taller orange bar "
            "「転職後 受付事務 380万円」 with orange badge 「年収 160万円UP」. "
            "Card 2: photo-realistic portrait of a 26-year-old Japanese man at an IT office (laptop in background). "
            "Green tag 「Sさん・26歳男性」, bold title 「販売員 → ITエンジニア」, "
            "bar chart grey 「転職前 300万円」 vs taller orange 「転職後 380万円」 with orange badge 「年収 80万円UP」. "
            "Bottom small text: 「※実際のハックツ就職利用者の事例です」. "
            "Overall: looks like a real results page from a premium recruitment brand."
        ),
    },
    "03_worry": {
        "label": "お悩みチェックリスト（落ち着いたトーン）",
        "style": ILLUSTRATION_STYLE,
        "prompt": (
            "Dark charcoal (#1F2937) section with subtle noise texture. "
            "Top small muted yellow label 「いくつ当てはまりますか？」. "
            "Main bold white headline: 「転職のお悩み」 with 「お悩み」 in muted gold. "
            "Below, four checklist items each with a green check-circle and white text: "
            "・「学歴なしでもホワイト企業に入れる？」 "
            "・「自分に合った仕事がわからない」 "
            "・「どの会社に応募すべきか判断できない」 "
            "・「書類選考が全然通らない」 "
            "On the right side (not bottom): an editorial-style semi-realistic illustration of a 20s man and woman "
            "looking thoughtful (not exaggerated cartoon — subtle worry expressions, natural proportions). "
            "Bottom: a narrow green bar transitioning to next section with 「1つでも当てはまる方へ」 in soft yellow text."
        ),
    },
    "04_gacha": {
        "label": "エージェントガチャ失敗データ（クリーンなインフォグラフィック）",
        "style": ILLUSTRATION_STYLE,
        "prompt": (
            "Clean white background section with premium infographic feel. "
            "Header in bold charcoal: 「『エージェントガチャ』に外れて、後悔した人は 約6割」 "
            "with 「6割」 in large orange. "
            "Small label above donut chart: 「Q. 過去に転職エージェントを利用した際、"
            "『後悔・失敗』と思ったことはありますか？」 in neutral grey. "
            "Large precision donut chart: 60% brick-orange segment labeled 「ある・少しある」 "
            "bold inside 「60%」, 40% light-grey segment labeled 「あまりない・ない」 with 「40%」. "
            "Below the chart, three card-style rows with red X icons (not cartoon crosses): "
            "「担当者の対応が雑」 / 「時間をかけたのに興味ない求人ばかり」 / 「返信が遅くて活動が停滞」 "
            "Footer grey caption: 「※当社が転職エージェント利用経験者に実施したアンケート調査結果」. "
            "Overall: looks like a legitimate data-driven insight from a professional agency."
        ),
    },
    "05_rely": {
        "label": "転職エージェントに頼ろう（落とし穴）",
        "style": ILLUSTRATION_STYLE,
        "prompt": (
            "Clean sectioned layout. Top: muted yellow pill badge 「1つでも当てはまる方は」 in charcoal text. "
            "Central large headline: 「転職エージェントに 頼りましょう」 with 「エージェント」 in deep green. "
            "Below headline, a 2x3 grid of white capability cards, each with a simple line-icon and black title: "
            "「自己分析」「書類作成」「面接対策」「非公開求人の紹介」「給与交渉」「企業とのマッチング」. "
            "Bottom two-row layout: "
            "Left: semi-realistic editorial portrait of a 30s woman career advisor in business attire (friendly but professional). "
            "Right: orange callout box 「転職のプロが "
            "すべてサポートしてくれます」 in charcoal. "
            "Below, a refined warning banner (not cartoonish) with a small red alert icon: "
            "「ただし、落とし穴も。」 "
            "and a line: 「自分に合ったエージェントを選べないと、転職を後悔することも。」 in dark red. "
            "Overall: corporate infographic feel."
        ),
    },
    "06_solution": {
        "label": "ハックツ就職にお任せ（写真・チーム）",
        "style": PHOTO_STYLE,
        "prompt": (
            "Trust hero section. Light green background with subtle gradient. "
            "Top small yellow pill 「そこで」 in charcoal text. "
            "Main bold charcoal headline: 「ハックツ就職に、お任せください。」 "
            "CRITICAL: The service name is 「ハックツ就職」 — the third katakana is 「ツ」 (tsu), "
            "NOT 「ス」 (su). Render as ハ-ッ-ク-ツ-就-職. Do not write 「ハックス就職」. "
            "Below headline: large PHOTO-REALISTIC group portrait of FOUR professional Japanese career advisors "
            "(2 men, 2 women, all 20s-30s, wearing tasteful business-casual / suits, standing together in a bright modern office, "
            "holding tablets or portfolios, confident but warm expressions). "
            "This should look like a real recruitment company team photo — natural lighting, high quality. "
            "Below the photo, centered tagline: 「あなたの "
            "理想のキャリアを叶える、専任チームが伴走します。」 "
            "with 「理想のキャリア」 in deep green. "
            "Small supporting line: 「業界経験・面接官経験のある認定アドバイザーが対応」."
        ),
    },
    "07_100agents": {
        "label": "100社から1社を紹介（控えめ信頼感）",
        "style": PHOTO_STYLE,
        "prompt": (
            "Premium typographic section. Deep green gradient background with subtle light rays. "
            "Top: small golden certification seal 「認定ネットワーク」 at the center top. "
            "Large layered headline on three lines: "
            "「提携エージェント」 in smaller white, "
            "「100社以上」 MASSIVE yellow outlined bold text, "
            "「の中から、あなたに合う1社を厳選紹介」 in white. "
            "「1社」 in brick orange for emphasis. "
            "Below headline: photo-realistic wide composite strip of professional career advisors "
            "(soft-focus row of 5-6 smiling Japanese professionals — showing "
            "the breadth of the network). "
            "Small grey caption: 「2026年4月時点 / ハックツ就職 提携実績」. "
            "Bottom 120px completely blank white (room for CTA — draw NO button). "
            "Overall: feels like an enterprise B2B service page, not a cartoon site."
        ),
    },
    "08_reasons": {
        "label": "ハックツ就職が選ばれる3つの理由（コーポレート）",
        "style": ILLUSTRATION_STYLE,
        "prompt": (
            "Clean white background section. "
            "Top centered bold headline 「ハックツ就職が 選ばれる3つの理由」. "
            "Three vertically stacked cards, each with a gold circular badge top-center saying REASON 01 / 02 / 03 and thin green border: "
            "Card 1: Title 「厳しい審査をクリアした プロだけが所属」. "
            "  Body 「全ての提携エージェントを自社基準で審査。内定実績・求職者評価を元に認定制度を運用」. "
            "  Small line-icon: shield with checkmark. "
            "Card 2: Title 「1人で転職するより、 内定獲得率が大幅UP」. "
            "  Body 「書類添削から面接対策まで、経験豊富なアドバイザーが二人三脚でサポート」. "
            "  Small line-icon: two people silhouette. "
            "Card 3: Title 「プロによる転職サポートが、 すべて完全無料」. "
            "  Body 「カウンセリング／求人紹介／書類作成／面接対策／内定後フォロー まで一切の料金は発生しません」. "
            "  Small line-icon: coin with slash. "
            "No cartoon characters. Focus on typography and iconography. Corporate, premium feel."
        ),
    },
    "09_white_criteria": {
        "label": "隠れホワイト求人の基準（写真混在）",
        "style": PHOTO_STYLE,
        "prompt": (
            "Professional layout on white background. "
            "Top headline: 「『隠れホワイト』求人の基準、 明確にしています。」 "
            "with 「隠れホワイト」 in deep green. "
            "Left side: a vertical list of five criteria with small gold check icons: "
            "✓「年間休日 120日以上」 "
            "✓「月平均残業 20時間以下」 "
            "✓「離職率 10%以下」 "
            "✓「未経験者向け研修制度あり」 "
            "✓「年収レンジ 350万円以上」 "
            "Right side: photo-realistic image of a modern clean Japanese office — natural daylight through windows, "
            "plants, employees working calmly. "
            "Bottom line: 「この基準をクリアした求人のみ、ハックツ就職ではご紹介しています。」 "
            "Small grey line: 「※2025年度 当社基準調べ」. "
            "CRITICAL: The service name is 「ハックツ就職」 — the third katakana is 「ツ」 (tsu), "
            "NOT 「ス」 (su). Render as ハ-ッ-ク-ツ-就-職. Do not write 「ハックス就職」."
        ),
    },
    "10_compare": {
        "label": "比較表（コーポレート）",
        "style": ILLUSTRATION_STYLE,
        "prompt": (
            "White background section. Bold headline 「他の方法と、何が違う？」. "
            "A clean 3-column comparison table, mobile-friendly, thin grey borders: "
            "Column headers (left to right): "
            "「転職サイト」 in grey, 「1社のエージェント」 in light green, "
            "「ハックツ就職」 in deep green with yellow background highlight. "
            "CRITICAL: The service name is 「ハックツ就職」 — the third katakana is 「ツ」 (tsu), NOT 「ス」 (su). "
            "Render as ハ-ッ-ク-ツ-就-職. Do not write 「ハックス就職」. "
            "Rows from top to bottom with small line-icons on the left: "
            "「ホワイト求人の多さ」 / 「エージェント選択の自由度」 / 「未経験OK求人」 / 「合わない時の変更」 / 「利用料」 "
            "Fill cells: ○ △ × etc. for the left two columns, all ◎ (double-circle) for the ハックツ就職 column "
            "except 利用料 row showing 「無料」 for all. "
            "Bottom small line: 「ハックツ就職なら、100社以上のエージェントから"
            "『あなたに合う1社』を厳選。」 "
            "Premium corporate design, no cartoon."
        ),
    },
    "11_jobs": {
        "label": "求人事例（写真）",
        "style": PHOTO_STYLE,
        "prompt": (
            "Section titled bold 「『隠れホワイト』求人の一例」. "
            "Two job cards stacked vertically on clean white background with subtle shadows: "
            "Card 1: Top half is a PHOTO-REALISTIC image of a bright modern IT office "
            "(open-space layout, employees collaborating over laptops, natural light, plants). "
            "Bottom half: row of three muted-yellow condition tags 「未経験OK」「フレックス」「住宅手当」, "
            "bold title 「IT業界 大手 K社」, clean price pill 「初年度年収 490万円」 in deep green. "
            "Card 2: Top half is a PHOTO-REALISTIC image of a stylish apparel retail store interior "
            "(clothes racks, warm lighting, friendly staff, modern shopfront). "
            "Bottom half: condition tags 「未経験OK」「家賃補助」「残業ゼロ」, "
            "bold title 「アパレル業界 Y社」, price pill 「初年度年収 500万円」. "
            "Overall feels like premium job board listings."
        ),
    },
    "12_voice": {
        "label": "ご利用者の声（写真ポートレート）",
        "style": PHOTO_STYLE,
        "prompt": (
            "Section titled 「ご利用者様の声」 bold charcoal, subline 「ハックツ就職で転職を成功させた方々」. "
            "Two testimonial cards on clean white background, each with a refined thin-line border: "
            "Card 1: Left side: PHOTO-REALISTIC portrait of a smiling 20s Japanese man at a gym/athletic setting "
            "(casual athletic wear, genuine warm smile, natural gym background). "
            "Right side body: small green tag 「Tさん・27歳男性 / 元飲食店→現 営業職」. "
            "Bold pull-quote: 「安心して任せられました。」 "
            "Body text: 「自分に向いている仕事がわからなかったのですが、ゆっくり丁寧に向き合ってくれる"
            "キャリアアドバイザーと出会えました。全てを肯定しながら相談に乗ってくださり、"
            "安心して転職活動を任せられました。」 "
            "Card 2: Left side: PHOTO-REALISTIC portrait of a gentle-smiling 20s Japanese woman "
            "(casual blouse, indoor natural-light setting, genuine expression). "
            "Right side body: green tag 「Mさん・25歳女性 / 元無職3年→現 事務職」. "
            "Bold pull-quote: 「ドタキャンも考えていました…」 "
            "Body text: 「3年間無職という私の状況を受け入れてもらえるか不安で、最初はドタキャンを"
            "考えていました。しかし勇気を出して話してみると、私の理想を叶える求人に出会えて本当に良かったです。」 "
            "Refined premium look, not cartoon."
        ),
    },
    "13_steps": {
        "label": "ご利用の流れ 5STEP（クリーン）",
        "style": ILLUSTRATION_STYLE,
        "prompt": (
            "Section titled 「ご利用の流れ」 bold charcoal on pale green background. "
            "Subtitle 「最短2週間で内定まで」 in deep green. "
            "Five vertically stacked step blocks, each with a gold STEP circle badge in the top-left and white card with soft shadow: "
            "STEP 01: clean line-illustration of a smartphone with LINE icon. "
            "  Pill badge 「30秒で完了」 in orange. Text: 「公式LINEから カウンセリング予約」. "
            "STEP 02: clean line-illustration of a laptop with a video call screen. "
            "  Pill 「完全オンライン」. Text: 「専任アドバイザーと ヒアリング面談」. "
            "STEP 03: clean line-illustration of a matching graph. "
            "  Pill 「100社から厳選」. Text: 「あなたに合うエージェントを 厳選マッチング」. "
            "STEP 04: clean line-illustration of a resume document with pen. "
            "  Pill 「二人三脚」. Text: 「書類作成・面接対策 サポート」. "
            "STEP 05: clean line-illustration of a confident handshake. "
            "  Pill 「ゴール」. Text: 「内定・入社 後もフォロー」. "
            "Thin green line connecting each step. No cartoon characters — icon-driven editorial style."
        ),
    },
    "14_faq": {
        "label": "よくある質問（洗練・コーポレート）",
        "style": ILLUSTRATION_STYLE,
        "prompt": (
            "Section with clean white background. "
            "Top centered bold headline 「よくある質問」 in deep green. "
            "Below, six Q&A cards stacked vertically with refined thin border and soft shadow: "
            "each card has a green 「Q」 circle on the left of the question, a grey 「A」 circle for answer. "
            "Q1: 「利用は無料ですか？」 / A: 「はい。ハックツ就職のサポートは、ご相談から内定獲得まですべて完全無料です。」 "
            "Q2: 「紹介されたキャリアアドバイザーと合わなかった場合、別の方を紹介していただけますか？」 / A: 「はい。合わないと感じた部分を再ヒアリングした上で、別のアドバイザーをご紹介します。」 "
            "Q3: 「オンラインで相談は可能ですか？」 / A: 「はい。ハックツ就職のサポートは完全オンラインで行っております。」 "
            "Q4: 「今すぐ転職する予定がなくても大丈夫ですか？」 / A: 「はい、キャリア相談のみのご利用も歓迎しています。」 "
            "Q5: 「本当に未経験でも紹介してもらえますか？」 / A: 「はい。ハックツ就職は未経験歓迎求人の紹介を専門としています。」 "
            "Q6: 「どれくらいの期間で転職できますか？」 / A: 「最短2週間、平均1〜2ヶ月で内定を獲得される方が多いです。」 "
            "Use the katakana 「ハックツ」 (NOT 「ハックズ」). Make all Japanese text perfectly accurate."
        ),
    },
    "15_final": {
        "label": "最終CTA前セクション（写真＋力強さ）",
        "style": PHOTO_STYLE,
        "prompt": (
            "Full-bleed emotional final push section. "
            "Background: a dimmed photo-realistic image of a confident 20s Japanese man and woman "
            "walking forward side-by-side out of an office building entrance, golden-hour backlight. "
            "On top of the background: large bold WHITE headline on two lines: "
            "「今動けば、」「半年後の給料明細が、変わる。」 "
            "「変わる」 in muted gold. "
            "Below headline, white subcopy: 「3年後のあなたは、今のあなたの決断に感謝するはず。」 "
            "Below subcopy, a thin row of 3 small white outlined pill labels: "
            "「最短2週間で転職成功」「利用料 完全無料」「LINEで気軽に相談」. "
            "Bottom 140px completely blank (room for the final CTA button — do NOT draw a button). "
            "Overall: emotionally compelling, professional, like an end-of-LP conversion moment for a premium service."
        ),
    },
}


def generate(section_id: str):
    if section_id not in SECTIONS:
        sys.exit(f"unknown section: {section_id}")
    spec = SECTIONS[section_id]
    prompt = spec["prompt"] + "\n\nSTYLE: " + BRAND_STYLE + "\n\nIMAGE APPROACH: " + spec["style"]
    print(f"[{section_id}] {spec['label']} ... generating")

    body = json.dumps({
        "model": "gpt-image-2",
        "prompt": prompt,
        "size": "1024x1536",
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
    with urlopen(req, timeout=600) as resp:
        data = json.loads(resp.read())
    dt = time.time() - t0

    b64 = data["data"][0]["b64_json"]
    out = OUT_DIR / f"{section_id}.png"
    out.write_bytes(base64.b64decode(b64))
    print(f"[{section_id}] saved -> {out} ({dt:.1f}s, {out.stat().st_size // 1024}KB)")


GROUPS = {
    "group1": ["01_fv", "02_success", "03_worry", "04_gacha"],
    "group2": ["05_rely", "06_solution", "07_100agents", "08_reasons"],
    "group3": ["09_white_criteria", "10_compare", "11_jobs", "12_voice"],
    "group4": ["13_steps", "14_faq", "15_final"],
}


def main():
    if len(sys.argv) < 2:
        sys.exit("usage: python generate.py <fv|all|group1..4|section_id>")
    target = sys.argv[1]
    if target == "fv":
        generate("01_fv")
    elif target == "all":
        for sid in SECTIONS:
            generate(sid)
    elif target in GROUPS:
        for sid in GROUPS[target]:
            generate(sid)
    else:
        generate(target)


if __name__ == "__main__":
    main()
