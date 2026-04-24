"""
ハックツ就職LP画像生成スクリプト (gpt-image-2)
ロゴ・CTAボタンは画像に含めず、HTML側で差し込む前提。
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
    "Mobile landing page section image, vertical portrait orientation, "
    "Japanese recruitment LP for 20s first-time job seekers (フリーター・ニート・未経験). "
    "Brand palette: bright leaf green (#3DB66A) primary, vivid yellow (#FFD93D) for accents/highlights, "
    "warm orange (#F08A3E) for call-outs, white background. "
    "Pop, friendly, youthful tone — illustration style with cartoon-like human figures "
    "(not photo-realistic). Bold Japanese typography. "
    "IMPORTANT: Do NOT include any logo, brand name image, or LINE CTA button in the image — "
    "leave clean space where those would go. No typos, accurate Japanese text rendering. "
    "Rounded corners, friendly shapes."
)

SECTIONS = {
    "01_fv": {
        "label": "FV: 隠れホワイト企業へ",
        "prompt": (
            "Hero section image. Top area left blank (30px padding) for service logo that will be added later. "
            "Small yellow badge at the top-right saying 「未経験専門就職サービス」. "
            "Three small green hashtag labels below: 「#フリーター」「#スキルゼロ」「でも!!」. "
            "Central massive bold headline stacked in two lines: "
            "「隠れホワイト企業へ」 with the word 「ホワイト」 in extra-huge white outlined text on green, "
            "rest in bold dark green. "
            "Below the headline a slim subline: 「未経験転職は、エージェント選びで9割決まる。」 "
            "To the right: cheerful cartoon illustration of a 20s Japanese man in a suit jumping with arms raised, confident smile. "
            "Three horizontal pill-shaped condition badges in orange rounded rectangles with yellow highlight bars: "
            "「年収500万円以上」「土日祝休み」「残業なし」. "
            "Below badges, a golden No.1 RANKING medal badge saying 「ホワイト求人数 No.1」. "
            "Footer tiny grey text: 「※2025年度当社実績調べ」. "
            "At the very bottom, leave empty rounded rectangle placeholder space (about 80px tall) "
            "with subtle dashed outline indicating where a LINE CTA button will be placed — DO NOT draw a button."
        ),
    },
    "02_success": {
        "label": "成功事例: 160万UP",
        "prompt": (
            "Section with top headline: 「未経験でも、成功者が続出!!」 "
            "The word 「成功者」 highlighted with yellow underline/marker. "
            "Below headline, two horizontally-arranged testimonial cards: "
            "Card 1: photo-style illustration of a smiling 24-year-old Japanese woman at a reception desk, green label overlay saying "
            "「フリーター から 受付事務職 に」 plus orange tag 「Iさん・24歳女性」. "
            "Below Card 1: a bar chart with 「160万 UP」 orange badge, showing 「転職前 飲食店 220万円」 → 「転職後 受付事務 380万円」 arrow. "
            "Card 2 (partially visible): young professional in suit, labels 「土日祝」「リモート」, job category 「IT業界」 with badge 「80万 UP」. "
            "Green background with yellow accent. Clean pop infographic style."
        ),
    },
    "03_worry": {
        "label": "お悩みチェックリスト",
        "prompt": (
            "Section with a dark grey/black card background. Top small yellow label: 「いくつ当てはまりますか？」. "
            "Main bold white headline: 「転職のお悩み」 with 「お悩み」 in yellow. "
            "Below, a checklist of 4 items each with a green check-circle icon on the left and white text: "
            "・「学歴なしでもホワイト企業に入れる？」 "
            "・「自分に合った仕事がわからない」 "
            "・「入社できる会社のラインがわからない」 "
            "・「書類選考が全然通らない」 "
            "Bottom: cartoon illustration of a troubled young Japanese man and woman, sweatdrops on heads, "
            "worried expressions. "
            "Footer green bar transitioning to the next section with text 「1つでも当てはまる方」 in yellow."
        ),
    },
    "04_gacha": {
        "label": "エージェントガチャ失敗データ",
        "prompt": (
            "Section titled in bold 「『エージェントガチャ』に外れて 後悔した人は 約6割も」 "
            "with 「6割」 in huge orange font. "
            "Central element: a donut/pie chart showing 60% filled in orange labeled 「ある・少しある」, "
            "40% grey labeled 「あまりない・ない」. "
            "Left side of chart: an illustrated worried 20s Japanese woman. "
            "Above chart small grey label: 「Q. 過去に転職エージェントを利用した際、"
            "『後悔・失敗』と思ったことはありますか？」 "
            "Below the chart, three red-cross bullet points: "
            "×「担当者の対応が雑」 "
            "×「時間をとったのに興味ない求人ばかり」 "
            "×「返信が遅くて転職活動が進まない」 "
            "Footer small grey caption: 「※利用経験者に回答いただいた当社アンケート調査の結果」. "
            "White background, dark green and orange as primary colors."
        ),
    },
    "05_rely": {
        "label": "転職エージェントに頼ろう（落とし穴）",
        "prompt": (
            "Green background section. Top yellow badge 「1つでも当てはまる方」. "
            "Central huge bold headline: 「転職エージェントに 頼りましょう！」 with 「エージェント」 in yellow. "
            "Below headline, six slanted green ribbons stacked like strips listing what agents do: "
            "「自己分析」「履歴書作成」「オンライン面接対策」「非公開求人の紹介」「給与UPの交渉」. "
            "Bottom section: illustrated Japanese career woman in business suit smiling. "
            "Orange callout box with: 「転職のプロが すべてサポート してくれます」. "
            "Red-background warning banner with alert icons: 「⚠ ただし 落とし穴も ⚠」 "
            "and grey text: 「自分に合ったエージェントを選べなければ 転職を後悔することも。」"
            "Small worried woman illustration at bottom."
        ),
    },
    "06_solution": {
        "label": "ハックツ就職にお任せ",
        "prompt": (
            "Section with light green background. Top small yellow badge 「そこで!!」. "
            "Big headline: 「【サービス名】に お任せください」 (note: leave the service name area as plain text 「【サービス名】」 — "
            "so the brand logo can be overlaid later). "
            "Large realistic-style illustration of 4 professional young Japanese career advisors (2 men, 2 women) "
            "in business attire, standing together smiling, holding folders/tablets, looking approachable. "
            "Bottom: a small mascot-style green character icon next to the text 「【サービス名】とは？」. "
            "Below that, text 「あなたの理想を叶える」 in bold with 「理想」 in orange."
        ),
    },
    "07_100agents": {
        "label": "100社から1社を紹介",
        "prompt": (
            "Section with green gradient background. Top golden 「認定」 seal badge. "
            "Massive headline stacked: 「提携エージェント100社以上の中から、あなたの理想を叶える"
            "1社を紹介！」 "
            "「100社以上」 in huge yellow text, 「1社」 in orange, 「紹介！」 in bold white. "
            "Two cartoon-illustrated young people (a man and a woman) below, smiling. "
            "Below them small green text 「100社から選び抜いたベストマッチ」. "
            "At the bottom leave empty dashed rectangle (about 80px tall) as placeholder "
            "for a LINE CTA button — DO NOT draw the button."
        ),
    },
    "08_reasons": {
        "label": "選ばれる3つの理由",
        "prompt": (
            "Section with white background. Top headline: 「【サービス名】が 選ばれる3つの理由」 "
            "(leave 「【サービス名】」 as placeholder text). "
            "Three stacked reason cards with yellow numbered circle badges REASON 01 / 02 / 03: "
            "REASON 01 card: 「厳しい審査をクリアした プロが所属」 "
            "  - 「提携する全エージェントは自社基準で厳選」 "
            "REASON 02 card: 「1人で転職するより 成功率が大幅UP」 "
            "  - 「書類・面接まで二人三脚でサポート」 "
            "REASON 03 card: 「プロによる転職サポートが 完全無料」 "
            "  - ribbon of 6 slanted green strips: 「カウンセリング」「オンライン面接」「求人紹介」「書類作成」「面接対策」「内定」 "
            "Orange POINT light-bulb icon in each card."
        ),
    },
    "09_white_criteria": {
        "label": "隠れホワイト求人の基準",
        "prompt": (
            "Section titled 「『隠れホワイト』の基準、明確にしています」 "
            "with 「隠れホワイト」 in orange. "
            "Below, a cleanly styled list of five criteria each with a yellow check-circle icon: "
            "✓「年間休日 120日以上」 "
            "✓「月残業時間 20時間以下」 "
            "✓「離職率 10%以下」 "
            "✓「未経験者研修あり」 "
            "✓「年収レンジ 350万円以上」 "
            "Right side: illustration of a modern office building with a golden shield badge. "
            "Bottom closing line: 「この基準をクリアした求人だけを、厳選してご紹介します。」 "
            "White background, green and orange color scheme."
        ),
    },
    "10_compare": {
        "label": "他手段との比較表",
        "prompt": (
            "Section titled 「他の方法と、何が違う？」. "
            "A clean comparison table with 3 columns: left header 「転職サイト」 grey, "
            "middle 「1社のエージェント」 light green, right 「【サービス名】」 bright green (highlighted). "
            "Rows (from top to bottom): "
            "「ホワイト求人の多さ」 / 「エージェント選択の自由度」 / 「未経験OK求人」 / 「合わない時の変更」 / 「費用」 "
            "Fill cells with circle/triangle/cross marks: ○△× for left two columns, all ◎ (double-circle) for the right column except "
            "費用 row showing 「無料」 for all. "
            "Right column is highlighted with yellow background band. "
            "Mobile-friendly stacked table style."
        ),
    },
    "11_jobs": {
        "label": "求人事例",
        "prompt": (
            "Section titled 「『隠れホワイト』求人例」. "
            "Two job example cards stacked vertically. "
            "Card 1: photo-style illustration of a modern IT office, workers at laptops. "
            "Yellow condition tags row: 「未経験OK」「フレックス」「住宅手当」. "
            "Bold title 「IT業界 大手K社」. Orange price box: 「初年度年収 490万円」. "
            "Card 2: photo-style illustration of a bright apparel/fashion store interior. "
            "Yellow condition tags row: 「未経験OK」「家賃補助」「残業ゼロ」. "
            "Bold title 「アパレル業界 Y社」. Orange price box: 「初年度年収 500万円」. "
            "Green accent theme."
        ),
    },
    "12_voice": {
        "label": "ご利用者の声",
        "prompt": (
            "Section titled 「ご利用者様の声」 in bold. "
            "Two testimonial cards stacked vertically, each with an illustrated portrait on the left side. "
            "Card 1 portrait: smiling 20s Japanese man at a gym (athletic background). "
            "Green label overlay: 「安心して任せられました」. "
            "Below body text in orange+grey: 「自分に向いている仕事がわからなかったのですが、ゆっくり丁寧に向き合ってくれるキャリアアドバイザーさんと出会えました。全てを肯定しながら相談に乗ってくださり、安心して転職活動を任せられました。」 "
            "Card 2 portrait: gentle-smile 20s Japanese woman with casual top. "
            "Green label overlay: 「ドタキャンも 考えてました…」. "
            "Body text: 「3年間無職という私の状況を受け入れてくださるのか不安で、最初はドタキャンを考えていました。しかし勇気を出して話してみると、私の理想を叶える求人に出会えて、本当に良かったです。」"
        ),
    },
    "13_steps": {
        "label": "ご利用の流れ 5STEP",
        "prompt": (
            "Section titled 「ご利用の流れ」 with bold header on pale green background. "
            "Five vertically stacked step blocks, each with a yellow STEP circle badge in top-left: "
            "STEP 01: cartoon illustration of a young man using a smartphone. Orange pill badge 「30秒でカンタン」. Text: 「公式LINEから カウンセリング予約」. "
            "STEP 02: illustration of a smartphone showing an online video-call face. Orange pill 「スマホから参加OK!」. Text: 「オンラインカウンセリング」. "
            "STEP 03: illustration of a friendly career advisor character. Orange pill 「プロがヒアリング」. Text: 「あなたに合うエージェントを選定」. "
            "STEP 04: illustration showing document/resume with a checkmark. Orange pill 「二人三脚サポート」. Text: 「書類作成・面接対策」. "
            "STEP 05: illustration of a happy person with a celebration confetti. Orange pill 「ゴール!」. Text: 「内定・入社」. "
            "Green downward triangle arrow between each step."
        ),
    },
    "14_faq": {
        "label": "よくある質問",
        "prompt": (
            "Section with a bright green background. Top centered white header banner: 「よくある質問」. "
            "Below, six Q&A cards stacked vertically on white background, each with a grey 「Q」 circle icon for question and green 「A」 circle icon for answer. "
            "Q1: 「利用は無料ですか？」 / A: 「はい。転職サポートは0から内定獲得まですべて無料ですので安心してご利用ください。」 "
            "Q2: 「紹介されたキャリアアドバイザーと合わなかった場合、別のキャリアアドバイザーを紹介していただけますか？」 / A: 「はい。合わないと感じた部分を再度ヒアリングし、別のキャリアアドバイザーを紹介させていただきます。」 "
            "Q3: 「オンラインで相談は可能ですか？」 / A: 「はい。サポートは完全オンラインで行っております。」 "
            "Q4: 「今すぐ転職する予定がなくても大丈夫？」 / A: 「はい、キャリア相談からお気軽にご利用いただけます。」 "
            "Q5: 「未経験でも本当に紹介してもらえますか？」 / A: 「はい、未経験歓迎の求人を中心にご紹介しています。」 "
            "Q6: 「どれくらいの期間で転職できますか？」 / A: 「最短2週間、平均1〜2ヶ月で内定獲得される方が多いです。」"
        ),
    },
    "15_final": {
        "label": "最終CTA前セクション",
        "prompt": (
            "Full-bleed emotional final push section. "
            "Bright green gradient background with subtle light rays. "
            "Huge bold white headline stacked on two lines: "
            "「今 動けば、」「半年後の給料明細が 変わる。」 "
            "「変わる。」 in yellow. "
            "Below subcopy in white: 「3年後のあなたは、今のあなたの決断に感謝するはず。」 "
            "Center illustration: a confident 20s Japanese man and woman stepping forward together, bright smiles. "
            "Below them three small white pill labels: 「最短2週間で転職成功」「利用料完全無料」「LINEで気軽に相談」. "
            "At the very bottom leave empty dashed rectangle (about 100px tall) as placeholder for the final LINE CTA button — DO NOT draw a button."
        ),
    },
}


def generate(section_id: str):
    if section_id not in SECTIONS:
        sys.exit(f"unknown section: {section_id}")
    spec = SECTIONS[section_id]
    prompt = spec["prompt"] + "\n\nSTYLE: " + BRAND_STYLE
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
