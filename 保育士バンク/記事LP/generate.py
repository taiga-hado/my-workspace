"""
保育士バンク 記事LP 画像生成スクリプト (gpt-image-2)
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
    "Mobile article landing page section image, vertical portrait orientation, "
    "for a Japanese childcare-worker (保育士) recruitment service called 「保育士バンク！」. "
    "Brand palette: warm coral pink (#FF6B8A) as primary, soft peach (#FFE5EC) as background tint, "
    "warm cream (#FFF8F0) for cards, sunny yellow (#FFD460) for accents, "
    "deep charcoal (#2D2D2D) for primary text, "
    "warm gray (#7A7A7A) for body text. "
    "Soft, warm, trustworthy, feminine but not childish — feel like a premium childcare-recruitment magazine. "
    "Typography: bold modern Japanese sans-serif (think Noto Sans JP, M PLUS Rounded) with rounded shapes, "
    "clean spacing, friendly. "
    "Subtle drop shadows, generous rounded corners, warm gradients. "
    "IMPORTANT: No logo mark, no CTA button rectangles in the image — leave generous blank padding so HTML can overlay buttons later. "
    "All Japanese text must be perfectly accurate, no typos, no garbled characters. "
    "Avoid stereotypical 'cartoon childcare' clip-art look — aim for refined editorial style."
)

PHOTO_STYLE = (
    "Use photo-realistic / stock-photo style imagery for people. "
    "Real Japanese women in their 20s-30s wearing soft-color childcare-worker aprons (エプロン) "
    "in pastel pink, light yellow, or cream. Real childcare classroom interiors with wooden floors, "
    "soft natural light through windows, age-appropriate toys. Genuine warm expressions. "
    "Photo-realistic but warm magazine-style retouching."
)

ILLUSTRATION_STYLE = (
    "Use clean, semi-realistic editorial illustration — NOT childish cartoon. "
    "Soft watercolor / gouache feel with warm pink/peach palette, gentle line work, "
    "natural human proportions, approachable but mature. Think modern parenting-magazine illustration."
)

CHAT_STYLE = (
    "Stylized LINE-style chat-bubble UI mockup. Clean white background, rounded chat bubbles with soft shadow, "
    "small circular avatar icons on the left of each bubble (use simple flat color avatars — no real faces). "
    "Use the brand palette."
)


SECTIONS = {
    "00_hero_photo": {
        "label": "新ヒーロー: 保育園のインテリア写真 (テキスト無し)",
        "style": PHOTO_STYLE,
        "prompt": (
            "Wide-angle photo-realistic interior shot of a luxurious, ultra-modern, premium upscale Japanese 保育園 "
            "(daycare / kindergarten) classroom — feel like a top-tier private institution or a high-end international school. "
            "Spacious open layout with soft warm wood pillars and exposed wooden ceiling beams, "
            "bright cream/peach ambient color tone, generous natural light streaming in from large floor-to-ceiling windows. "
            "Multiple round low play tables with small soft pastel chairs (pink, cream, mint), "
            "colorful but tasteful pastel toys on shelves, a few hanging round paper lanterns near the ceiling, "
            "soft round area rugs on the wooden floor. Sense of calm, premium quality, abundance, sunshine. "
            "ABSOLUTELY NO text, NO logos, NO people, NO captions, NO labels, NO badges anywhere in the image — "
            "this is a pure architectural interior photo only. The image will be used as a hero photo with HTML overlay text on top. "
            "Color palette: warm cream, soft peach, light wood, pastel pink, sunshine yellow. "
            "Highly photorealistic, magazine architectural photography quality, slightly soft warm filter."
        ),
    },
    "01_fv": {
        "label": "FV: マガジン特集インタビュー風 (Before/After編集デザイン)",
        "style": PHOTO_STYLE,
        "prompt": (
            "Single integrated mobile-portrait MAGAZINE FEATURE COVER image, vertical orientation. "
            "Editorial magazine spread aesthetic — feel like a high-end women's lifestyle magazine "
            "(NOT a hard-sell advertorial poster). "
            ""
            "ZONE 1 (very TOP, ~4% of height): Thin cream-colored editorial header strip. "
            "Left side small dark serif text: 「保育士のお仕事Magazine」. "
            "Right side small grey uppercase label: 「Vol.01 SPECIAL」. Thin pink hairline divider beneath. "
            ""
            "ZONE 2 (UPPER MIDDLE, ~55% of height): Large portrait PHOTO-REALISTIC photo of a 28-year-old Japanese woman "
            "with a soft confident smile, natural light, wearing a soft pastel pink childcare-worker apron over a clean white shirt, "
            "head-and-shoulders / half-body crop, positioned to the RIGHT 60% of the frame, "
            "warm cream-peach blurred classroom background with soft bokeh, slightly out-of-focus pastel toys behind her. "
            "Editorial portrait quality — premium magazine photography, golden-hour soft warm light. "
            ""
            "Overlay text ON the photo, LEFT SIDE (vertical stack, leaving the woman's face on the right unobstructed): "
            "(a) Tiny upper-case red label 「 ─ INTERVIEW #01」 in a small modern sans-serif. "
            "(b) Below, a HUGE 3-line magazine-style HEADLINE in dark charcoal Mincho/serif Japanese font: "
            "Line 1 (medium): 「気づけば、」 "
            "Line 2 (extra large, the hero line): 「年収[480万]、年休[128日]。」 — the 「480万」 and 「128日」 portions are "
            "highlighted with a thick BRIGHT YELLOW horizontal marker stroke behind them. "
            "Line 3 (medium): 「私が転職した、たった1つの話。」 "
            "(c) Tiny grey attribution below the headline: 「あや 28歳 / 保育歴6年」. "
            ""
            "ZONE 3 (BOTTOM, ~41% of height): Soft cream / pale-peach background. Stack from top: "
            "(a) Centered small dark uppercase header label 「── DATA / 私の転職、ビフォーアフター ──」 in clean modern sans-serif, "
            "with thin coral horizontal hairlines on each side. "
            "(b) Below, a clean horizontal 2-column DATA TABLE side-by-side: "
            "  LEFT COLUMN (grey muted tone, labeled 「BEFORE」 in small uppercase grey at top): "
            "    Stacked rows of dark grey text: 「月収  22万」, 「年収  280万」, 「年休  95日」, 「残業  月40h」. "
            "  CENTER: a large coral-pink right-pointing ARROW 「▶」 between the two columns. "
            "  RIGHT COLUMN (vibrant coral-pink tone, labeled 「AFTER」 in small uppercase coral at top): "
            "    Stacked rows of bold dark text: 「月収  38万」, 「年収  480万」, 「年休  128日」, 「残業  ほぼ0h」. "
            "    The numbers 「38万」「480万」「128日」「ほぼ0h」 are highlighted with subtle yellow marker accent. "
            "(c) Below the table, a centered horizontal row of FOUR small white rounded-rectangle pill badges with thin grey outline border, "
            "each with dark bold text: 「月収38万」 「ボーナス4ヶ月」 「残業なし／有休100%」 「借上社宅あり」. "
            ""
            "ALL Japanese text must be rendered PERFECTLY accurate, no typos, no garbled kanji, no missing characters. "
            "Aesthetic: refined editorial magazine cover, NOT an advertorial banner. "
            "Color palette: warm cream, soft peach, coral pink accents, dark charcoal text, muted grey for BEFORE column. "
            "DO NOT add any extra random text, watermarks, or decorative elements outside what is specified above."
        ),
    },
    "_old_01_fv_DELETED": {
        "label": "(deprecated, kept for reference) FV: 一体型ポスターヒーロー",
        "style": PHOTO_STYLE,
        "prompt": (
            "Single integrated mobile-portrait POSTER image, vertical orientation. Three stacked zones top-to-bottom: "
            ""
            "ZONE 1 (very TOP, ~7% of height): Full-width SOLID horizontal banner with a smooth coral-pink-to-soft-orange gradient "
            "(left-to-right or top-to-bottom). Inside the banner, perfectly centered WHITE bold large text: "
            "「保育士のお仕事Magazine」. Slight white drop shadow on text for premium look. "
            ""
            "ZONE 2 (MIDDLE, ~33% of height): Soft cream / pale peach solid background. Stack from top: "
            "(a) Centered SINGLE solid CHARCOAL-BLACK rounded-rectangle PILL/BADGE, with WHITE bold text inside: "
            "「業界最大級10万件の非公開求人がザクザク見放題！」 (single line, slight rounded corners). "
            "(b) Centered three-line MASSIVE Japanese headline in DARK CHARCOAL bold, all three lines tightly stacked: "
            "Line 1 (smaller): 「超ブラック保育士が試してみたら…」 "
            "Line 2 (larger, the hero line): 「年収[500万]、年休[130日]にソッコー内定」 — but use the alternative numbers "
            "「年収[480万]、年休[128日]にソッコー内定」 instead. The 「480万」 and 「128日」 portions are MUCH larger "
            "(roughly 1.5x the surrounding text) AND highlighted with a thick BRIGHT YELLOW horizontal marker stroke "
            "behind them (covering the bottom 50-60% of the characters, like a highlighter pen). "
            "Line 3: 「[超ホワイト園]ならゆる〜く稼げる」 — the 「超ホワイト園」 portion has the same yellow highlighter marker behind it. "
            "(c) Below the headline, a centered horizontal row of FOUR white rounded-rectangle pill badges with thin grey outline border, "
            "each with dark bold text: 「月収38万」 「ボーナス4ヶ月」 「残業なし/有休100%」 「借上社宅あり」. "
            ""
            "ZONE 3 (BOTTOM, ~60% of height): A large PHOTO-REALISTIC photo (not illustration) filling the area, depicting a wide interior shot of "
            "an ULTRA-MODERN, hotel-lobby-style premium Japanese daycare classroom with high wood ceiling, paper lantern pendant lights, "
            "warm cream/peach tone, herringbone wood floor, low pastel-color play tables and chairs, lots of natural light from large windows, "
            "no people visible. Premium, aspirational atmosphere. "
            "Overlay elements ON TOP of the photo: "
            "(i) TOP-LEFT corner ribbon: a SOLID DARK-RED rectangular flag with WHITE small bold text 「保育士さんの転職成功インタビュー！#1」 "
            "(only the top-left, rectangular shape with squared right edge and bottom edge). "
            "(ii) LEFT-MIDDLE: a CORAL-PINK rounded pill badge attached to the left edge (extending out from the left), "
            "with WHITE bold text 「業界上位の保育園」. "
            "(iii) BOTTOM area of the photo: A subtle dark-translucent gradient overlay (transparent at top, semi-opaque dark at bottom) "
            "to make text readable. On top of the gradient, centered WHITE bold text in two lines: "
            "Line 1 (smaller): 「新人からベテランまで」 "
            "Line 2 (HUGE bold): 「月収22万 → 38万UP」 — the 「22万」 and 「38万UP」 portions are HIGHLIGHTED with a thick BRIGHT YELLOW marker "
            "stroke behind them (like the headline area). The arrow 「→」 is also white bold. "
            ""
            "ALL Japanese text must be rendered PERFECTLY accurate, no typos, no garbled kanji, no missing characters. "
            "Layout should feel like a professional advertorial / magazine cover poster. "
            "DO NOT add any extra random text, watermarks, or decorative elements outside what is specified above."
        ),
    },
    "02_pain": {
        "label": "悩みセクション (LINEチャット風)",
        "style": CHAT_STYLE,
        "prompt": (
            "Pain-point section. Top centered bold headline 「こんな悩み、ありませんか？」 in dark charcoal, "
            "「悩み」 highlighted with a yellow marker stroke underneath. "
            "Below the headline, a small subline 「現役保育士のリアルな声」 in warm gray. "
            "Below: a vertical stack of 5 LINE-style chat bubbles, each with a small round flat-color avatar "
            "(no real faces — abstract circle with single-color silhouette) on the left, and a soft cream "
            "rounded chat bubble with dark text on the right. "
            "Bubble 1 (peach avatar): 「給料が手取り18万…責任重いのに割に合わない…」 "
            "Bubble 2 (mint avatar): 「サビ残・持ち帰り当たり前。月の残業40時間超えてる…」 "
            "Bubble 3 (lavender avatar): 「先輩や園長との人間関係で毎日メンタル削られる…」 "
            "Bubble 4 (yellow avatar): 「保護者対応が本当にしんどい。クレーム怖い…」 "
            "Bubble 5 (coral avatar): 「有給ほぼ取れない。プライベートが消えた…」 "
            "Below the bubbles, a coral pink emphasized text: 「1つでも当てはまるなら、転職を考えるサインかも。」 "
            "Pure white background, generous padding, refined editorial UI feel."
        ),
    },
    "03_empathy": {
        "label": "共感セクション (私もそうだった)",
        "style": PHOTO_STYLE,
        "prompt": (
            "Empathy bridge section. Top headline in dark bold: 「実は、私もそうでした。」 "
            "「私も」 highlighted in coral pink. "
            "Below: a soft subline 「でも、ある転職サービスに登録してから人生が変わりました。」 in warm gray. "
            "Center: PHOTO-REALISTIC photo of a 27-year-old Japanese woman in casual private clothes "
            "(beige knit + denim) sitting on a soft cream sofa at home, looking down at her smartphone "
            "with a relieved gentle smile, soft window light, cozy living room background slightly blurred. "
            "Photo has a soft warm filter and rounded corners. "
            "Below the photo, a quote in italic-feel handwritten-style font: "
            "「『非公開求人』が想像以上に多くて驚きました。条件のいい園、ちゃんとあるんですね。」 "
            "Small attribution under quote: 「— Sさん（28歳・保育士歴6年）」 in warm gray. "
            "Generous white space, magazine-article feel, not pushy."
        ),
    },
    "04_about": {
        "label": "保育士バンクとは (サービス紹介)",
        "style": ILLUSTRATION_STYLE,
        "prompt": (
            "Service introduction section. Top centered small label in coral 「\\ 保育士のための転職サービス /」. "
            "Below, a HUGE service brand name in custom-styled typography: 「保育士バンク！」 in deep charcoal bold, "
            "with the 「バンク」 portion in coral pink, and a small subtitle below: 「Hoikushi Bank」 in thin English letters. "
            "Below brand name, a centered tagline in 2 lines: "
            "「業界最大級10万件以上の求人から、」「あなたにピッタリのホワイト園を見つけます。」 "
            "「10万件以上」 emphasized in coral large. "
            "Below: a horizontal row of 4 stat cards (cream rounded squares with soft shadow), each showing a number and label: "
            "Card 1: 「10万件＋」 / 「業界最大級の求人数」 "
            "Card 2: 「60％」 / 「非公開求人の割合」 "
            "Card 3: 「98％」 / 「利用者満足度」 "
            "Card 4: 「0円」 / 「完全無料」. "
            "Numbers in coral pink bold, labels in dark charcoal. "
            "Below: a small soft watercolor-style illustration of a smiling female childcare worker "
            "holding hands with a small child silhouette, in pastel pink/peach palette. "
            "Pure cream background, generous padding."
        ),
    },
    "05_jobs": {
        "label": "求人例 (3パターン)",
        "style": PHOTO_STYLE,
        "prompt": (
            "Job examples section. Top centered headline in dark bold: 「こんな好条件の求人があります」 "
            "with 「好条件」 highlighted with yellow marker underline. "
            "Below, small subline: 「※すべて保育士バンク掲載の実例（2025年4月時点）」 in warm gray. "
            "Below: a vertical stack of 3 job-card panels, each card has a soft photo header on top "
            "and condition tags below in coral/yellow rounded pills. "
            "Card 1 — top photo of a bright modern wood-themed CLASSROOM in a 認可保育園 (large window, "
            "low wooden tables, pastel toys, no people visible). Tag header: 「認可保育園 (東京・正社員)」. "
            "Below photo, large salary text: 「月給28万円〜 / 賞与年4ヶ月」 in dark bold. "
            "Coral pill tags row: 「年間休日125日」「借上社宅あり」「残業月5h以下」「賞与4ヶ月」. "
            "Card 2 — top photo of a sleek modern OFFICE-BUILDING DAYCARE (企業内保育園) interior, "
            "white walls, modern soft toys, small group room. Tag header: 「企業内保育園 (横浜・正社員)」. "
            "Salary: 「月給32万円〜 / 完全週休2日」. "
            "Coral pills: 「土日祝休み」「残業ほぼ0」「育休復帰率100%」「定員12名」. "
            "Card 3 — top photo of a cozy SMALL HOME-LIKE DAYCARE ROOM (小規模保育園), "
            "warm wood interior, low ceiling, small play area, no people. Tag header: 「小規模保育園 (大阪・正社員)」. "
            "Salary: 「月給26万円〜 / 賞与年3回」. "
            "Coral pills: 「定員19名」「家賃補助あり」「年間休日120日」「賞与3回」. "
            "Cream background, generous spacing between cards."
        ),
    },
    "06_strengths": {
        "label": "保育士バンクの強み (4つ)",
        "style": ILLUSTRATION_STYLE,
        "prompt": (
            "Service strengths section. Top centered headline in dark bold: 「保育士バンクが選ばれる4つの理由」 "
            "with 「4つの理由」 in coral pink. "
            "Below: a 2x2 grid of 4 feature cards (cream rounded squares with soft shadow). "
            "Each card has a soft watercolor circular icon at top in pastel coral/yellow, "
            "a number badge ❶❷❸❹ in coral, a bold title, and a 2-line description. "
            "Card ❶ icon: stack of files / documents. Title: 「業界最大級の求人数」. "
            "Description: 「全国10万件以上の保育士求人から、あなたの希望に合う園を厳選してご紹介。」 "
            "Card ❷ icon: a small lock with a star. Title: 「非公開求人が約60%」. "
            "Description: 「他では出回らない好条件求人を、登録者だけにご案内します。」 "
            "Card ❸ icon: two people talking in profile silhouette. Title: 「専属コンシェルジュが伴走」. "
            "Description: 「業界に詳しいアドバイザーが履歴書から面接対策まで完全サポート。」 "
            "Card ❹ icon: a coin with a 0 mark. Title: 「ご利用は完全無料」. "
            "Description: 「ご相談から内定後のフォローまで、費用は一切いただきません。」 "
            "Pure cream background, generous spacing, warm magazine feel."
        ),
    },
    "07_voices": {
        "label": "利用者の声 (3名)",
        "style": PHOTO_STYLE,
        "prompt": (
            "User testimonials section. Top centered headline in dark bold: 「保育士バンク利用者の声」 "
            "with a small subline 「※実際にご利用いただいた方の体験談」 in warm gray. "
            "Below: a vertical stack of 3 testimonial cards, each with a small round photo portrait on the upper-left, "
            "a name+age tag, a coral 「Before → After」 result strip, and a multi-line quote. "
            "Card 1: small circular photo of a smiling 25-year-old Japanese woman in pastel pink apron, soft natural light. "
            "Name tag: 「R.Fさん (25歳・保育歴3年)」. "
            "Result strip: 「年収280万円 → 450万円」 with arrow, large coral numbers. "
            "Quote: 「最初は転職に不安でしたが、担当の方が園の雰囲気まで詳しく教えてくれて安心。"
            "今は子どもたちと余裕を持って向き合えています。」 "
            "Card 2: small circular photo of a 28-year-old Japanese woman in cream apron with gentle smile. "
            "Name tag: 「M.Sさん (28歳・保育歴6年)」. "
            "Result strip: 「残業月30h → ほぼ0h」 large coral. "
            "Quote: 「持ち帰り仕事と残業で限界でした。今は定時で帰れて、自分の時間が戻ってきました。」 "
            "Card 3: small circular photo of a 32-year-old Japanese woman in light yellow apron, warm smile. "
            "Name tag: 「K.Tさん (32歳・保育歴10年)」. "
            "Result strip: 「賞与なし → 年4ヶ月分」 large coral. "
            "Quote: 「条件交渉まで代わりにやってくれて、自分では絶対無理でした。本当に登録してよかったです。」 "
            "Cream background, soft shadows, generous spacing."
        ),
    },
    "08_steps": {
        "label": "3ステップで簡単登録",
        "style": ILLUSTRATION_STYLE,
        "prompt": (
            "Easy 3-step registration section. Top centered headline in dark bold: 「30秒で登録完了！カンタン3ステップ」 "
            "with 「30秒」 highlighted in coral pink large. "
            "Below: a horizontal row (or vertical stack on mobile) of 3 step cards in cream rounded squares with soft shadow, "
            "connected with thin coral arrows between them. "
            "Step 1 card: large coral 「STEP 01」 label, soft watercolor icon of a smartphone with a pink chat bubble, "
            "title 「カンタン無料登録」, description 「お名前・連絡先など、30秒で入力完了。」 "
            "Step 2 card: large coral 「STEP 02」 label, soft watercolor icon of two people in profile across a table, "
            "title 「専属アドバイザーと面談」, description 「電話orオンラインで希望条件をヒアリング。」 "
            "Step 3 card: large coral 「STEP 03」 label, soft watercolor icon of a happy female holding a job offer paper, "
            "title 「求人紹介・転職成功」, description 「ピッタリの園をご紹介。条件交渉もお任せ！」 "
            "Below the steps, a small reassurance line 「※登録後、しつこい営業電話は一切ありません。」 in warm gray. "
            "Pure white background, generous padding."
        ),
    },
    "09_final": {
        "label": "最終CTA前 エモーショナル",
        "style": PHOTO_STYLE,
        "prompt": (
            "Final emotional push section. Full-bleed background: a softly dimmed photo-realistic image "
            "of a 28-year-old Japanese woman childcare-worker in pastel pink apron, smiling genuinely "
            "while interacting with toddlers in a bright sunlit wooden classroom, warm golden-hour light "
            "streaming through a window. The photo has a slight pink/cream warm filter overlay so white text reads cleanly. "
            "On top of the background image, large bold WHITE 2-line headline centered: "
            "「『辞めたい』のままで、」「終わらないで。」 with 「終わらないで」 in soft yellow. "
            "Below the headline, white subcopy in 2 lines: "
            "「ホワイト園は、ちゃんとあります。」「あなたの『その一歩』を、保育士バンクが全力でサポートします。」 "
            "「保育士バンク！」 in soft yellow. "
            "Below subcopy, a thin row of 3 small white outlined pill labels: "
            "「30秒で簡単登録」「完全無料」「在職中OK」. "
            "Bottom 150px completely blank — leave clear room for an HTML CTA button overlay. Do NOT draw any button. "
            "Overall mood: emotionally warm, hopeful, decisive moment of conversion."
        ),
    },
    "10_painting": {
        "label": "悩みイラスト: 暗い背景に泣き顔の保育士+複数の吹き出し",
        "style": ILLUSTRATION_STYLE,
        "prompt": (
            "Dark, gloomy editorial illustration with a chalk-grey/charcoal grid-pattern background. "
            "Center: a soft watercolor-style cartoon illustration of a 27-year-old female childcare worker "
            "in a yellow apron, with anime-style sweat drops on her forehead, sad teary expression, mouth open in stressed cry, "
            "hands at her sides, pastel skin tones, simple line art. "
            "Around her are 5 large dark navy-grey speech bubbles (cloud / thought-bubble shapes) with WHITE bold Japanese text inside: "
            "Top center bubble: 「もうこんな職場、限界…💧」 (with sweat drop emoji style). "
            "Top-left bubble: 「給料も賞与も少なすぎ／評価制度ゼロ」. "
            "Top-right bubble: 「激務／持ち帰り／サビ残オンパレード」. "
            "Bottom-left bubble: 「年間休日少なすぎ／有給ぜんぜん消化できない」. "
            "Bottom-right bubble: 「シフト希望は通らない／人間関係キツい」. "
            "All Japanese text rendered perfectly accurate, no typos, no garbled kanji. "
            "Composition: square-ish vertical layout. Use brand coral pink and soft yellow as accent strokes on bubble outlines. "
            "Overall mood: heavy, exhausted, emotionally raw — convey the breaking point."
        ),
    },
    "11_recruit": {
        "label": "高待遇求人ポスター: ラグジュアリー施設+ステータスオーバーレイ",
        "style": PHOTO_STYLE,
        "prompt": (
            "Premium recruitment poster style image, vertical orientation. "
            "Background: PHOTO-REALISTIC wide-angle shot of an ULTRA-LUXURIOUS, hotel-lobby-style premium daycare interior — "
            "high coffered ceiling with warm recessed lighting, herringbone wood floor, designer pendant lights, "
            "framed art on creamy walls, low-slung pastel furniture, large floor-to-ceiling windows with soft natural light. "
            "Feel like a five-star hotel rather than a typical daycare. Warm cream/peach color tone. "
            "In the upper-right corner, an elegant white SCRIPT-style handwritten English logo: 「Recruit!」 (cursive, elegant). "
            "Across the lower 2/3 of the image, large WHITE bold Japanese stat overlays positioned organically across the photo: "
            "Left side: 「月収」 small + 「38」 huge + 「万円」 → on next line 「賞与」 + 「4」 huge + 「ヶ月」 "
            "→ next line 「年収」 + 「480」 huge + 「万円」. "
            "Center: 「年間休日」 + 「128」 huge yellow-highlighted + 「日」, then below 「土日祝休み」, "
            "「有給」「100」「％消化」, and 「残業／持ち帰り仕事なし」. "
            "Right side: 「借上社宅」 + 「(毎月)7.5万円」, then 「人間関係良好」, 「昇給年2回」. "
            "Numbers are extra large and bold to grab attention. All text in clean white with subtle dark drop shadow. "
            "Yellow marker highlight on key numbers like 「128」「480」「38」. "
            "All Japanese text rendered perfectly, no typos. "
            "Premium, aspirational, upscale recruitment poster aesthetic."
        ),
    },
    "12_service_card": {
        "label": "サービス紹介カード: 笑顔の保育士+保育士バンクロゴ+特徴",
        "style": PHOTO_STYLE,
        "prompt": (
            "Service introduction visual, vertical card style. "
            "Top section (60% of image): PHOTO-REALISTIC photo of a 27-year-old smiling Japanese woman in a soft pastel pink "
            "childcare-worker apron, holding two cute hand puppets (one orange tiger, one pink pig) in front of her, "
            "warm natural sunlight, bright cream classroom background slightly out of focus. "
            "Top-left of the photo: an elegant stacked logo — small upper text 「保育士の求人・転職なら」 in black, then HUGE bold black 「保育士」 next to coral pink bold 「バンク！」 (with the exclamation mark as part of the brand). "
            "Floating around her photo (left side stacked vertically), four small pastel CIRCULAR badges with bold dark text: "
            "Circle 1 (peach pink): 「有休」 / 「100％」. "
            "Circle 2 (mint): 「年休」 / 「128日以上」. "
            "Circle 3 (lavender): 「残業」 / 「一切なし」. "
            "Circle 4 (yellow): 「ボーナス4ヶ月」 / 「役職候補」. "
            "Lower-right corner: small decorative pastel polka-dot motif. "
            "Below the photo (lower 40% of image): a coral pink horizontal banner with WHITE bold text: "
            "「保育士業界 \"トップレベル\" の求人数！」, "
            "Then under the banner, three rectangular feature cards in pastel cream with bold dark text: "
            "Card A: 「月収」「38」「万円」「非公開求人多数」. "
            "Card B: 「土日祝休み／残業なし」「有休100％」「ゆる〜く働く」. "
            "Card C: 「履歴書添削・面接対策」「サポート充実」. "
            "All Japanese text rendered perfectly, no typos. "
            "Warm, friendly, professional service-introduction aesthetic."
        ),
    },
    "14_avatar_her": {
        "label": "アバター: ワタシ (女性キャラ・チャット用)",
        "style": ILLUSTRATION_STYLE,
        "prompt": (
            "Single CIRCULAR avatar illustration on a transparent / pure-white square background. "
            "Soft watercolor / gouache cute editorial illustration of a young Japanese woman, around 27 years old, "
            "shown ONLY HEAD-AND-SHOULDERS (close portrait), centered in the frame, "
            "shoulder-length brown wavy hair, soft brown eyes, gentle warm smile, "
            "wearing a soft pastel pink/cream casual top (no apron — this is private-life mode). "
            "Skin tone: soft warm Japanese complexion. "
            "Clean line work, restrained colors, modern parenting-magazine illustration style — friendly approachable mature woman, "
            "NOT a children's-book cartoon. "
            "Background: pure soft cream/peach circular background that fills a circle in the center. "
            "Composition: tight portrait, head occupies about 70% of the circle, slight smile expression. "
            "ABSOLUTELY NO text, NO logos, NO captions, NO speech bubbles. Just the portrait. "
            "Color palette: pastel pink, peach, cream, soft brown."
        ),
    },
    "15_avatar_him": {
        "label": "アバター: カレ (男性キャラ・チャット用)",
        "style": ILLUSTRATION_STYLE,
        "prompt": (
            "Single CIRCULAR avatar illustration on a transparent / pure-white square background. "
            "Soft watercolor / gouache cute editorial illustration of a young Japanese man, around 28 years old, "
            "shown ONLY HEAD-AND-SHOULDERS (close portrait), centered in the frame, "
            "short clean dark-brown hair (slight side-part), soft brown eyes, gentle friendly smile, "
            "wearing a soft pale-blue or grey casual t-shirt or knit (relaxed at-home look). "
            "Skin tone: soft warm Japanese complexion. "
            "Clean line work, restrained colors, modern editorial illustration style — friendly approachable young man, "
            "NOT a children's-book cartoon. "
            "Background: pure soft pale-blue/grey circular background that fills a circle in the center. "
            "Composition: tight portrait, head occupies about 70% of the circle, slight smile expression. "
            "ABSOLUTELY NO text, NO logos, NO captions, NO speech bubbles. Just the portrait. "
            "Color palette: soft sky blue, pale grey, cream, soft brown."
        ),
    },
    "17_voice_kana": {
        "label": "利用者写真: 田中 香奈 (24歳・保育歴3年)",
        "style": PHOTO_STYLE,
        "prompt": (
            "Single PHOTO-REALISTIC square portrait photo of a 24-year-old Japanese woman "
            "with shoulder-length brown wavy hair, gentle bright smile, soft warm makeup, fresh youthful expression. "
            "She is wearing a SOFT PASTEL PINK childcare-worker apron (エプロン) over a clean white t-shirt. "
            "Half-body / upper-chest crop, head occupies the upper half of the frame. "
            "Background: warm bright cream-yellow childcare classroom interior, slightly out-of-focus pastel toys and wooden shelves visible behind her, "
            "soft natural sunlight from the side. "
            "Magazine-style stock-photo quality, soft warm filter, professional editorial portrait. "
            "ABSOLUTELY NO text, NO logos, NO captions, NO watermarks anywhere. "
            "Composition centered, suitable for cropping into a circular avatar. "
            "Color palette: warm cream, pastel pink, soft peach, warm wood. "
            "Genuine warm smile (not posed)."
        ),
    },
    "18_voice_risa": {
        "label": "利用者写真: 山本 莉沙 (28歳・保育歴6年)",
        "style": PHOTO_STYLE,
        "prompt": (
            "Single PHOTO-REALISTIC square portrait photo of a 28-year-old Japanese woman "
            "with mid-length straight black hair tied half-up, calm gentle smile, mature confident expression, "
            "subtle natural makeup. "
            "She is wearing a CREAM / OFF-WHITE childcare-worker apron (エプロン) over a soft pastel blue blouse. "
            "Half-body / upper-chest crop, head occupies the upper half of the frame. "
            "Background: warm bright cream-toned childcare classroom interior, slightly out-of-focus wooden play tables and pastel cushions behind her, "
            "soft natural daylight. "
            "Magazine-style stock-photo quality, soft warm filter, professional editorial portrait. "
            "ABSOLUTELY NO text, NO logos, NO captions, NO watermarks anywhere. "
            "Composition centered, suitable for cropping into a circular avatar. "
            "Color palette: warm cream, soft blue, pale peach, warm wood. "
            "Calm gentle smile (mature, composed feel)."
        ),
    },
    "19_voice_minami": {
        "label": "利用者写真: 佐藤 美奈実 (32歳・保育歴10年)",
        "style": PHOTO_STYLE,
        "prompt": (
            "Single PHOTO-REALISTIC square portrait photo of a 32-year-old Japanese woman "
            "with shoulder-length warm-brown layered hair, warm motherly smile, gentle wise eyes, "
            "natural soft makeup, slightly mature look. "
            "She is wearing a SOFT BUTTERY YELLOW childcare-worker apron (エプロン) over a beige knit top. "
            "Half-body / upper-chest crop, head occupies the upper half of the frame. "
            "Background: warm bright cream-toned childcare classroom interior, slightly out-of-focus children's drawings and wooden shelves behind her, "
            "soft warm afternoon light. "
            "Magazine-style stock-photo quality, soft warm filter, professional editorial portrait. "
            "ABSOLUTELY NO text, NO logos, NO captions, NO watermarks anywhere. "
            "Composition centered, suitable for cropping into a circular avatar. "
            "Color palette: warm cream, buttery yellow, soft beige, warm wood. "
            "Warm motherly smile (slightly older, experienced feel)."
        ),
    },
    "16_problem_list": {
        "label": "悩みリスト: 5項目チェックリスト画像",
        "style": ILLUSTRATION_STYLE,
        "prompt": (
            "Editorial infographic, vertical layout, soft cream background. "
            "Top centered small label in coral pink: 「\\ 現役保育士の悩みTOP5 /」. "
            "Below, top centered HUGE bold black headline in modern Japanese sans-serif: "
            "「保育士が辞めたい理由」 with the 「辞めたい理由」 portion highlighted with a bright YELLOW marker stroke. "
            "Below the headline, 5 stacked CHECKLIST items, each separated by a thin pink dotted divider line: "
            "Each item has a large mint-green CHECK MARK ✓ icon in a soft rounded square on the left and dark Japanese text on the right, "
            "with key phrases highlighted with a soft yellow marker underline. "
            "Item 1: 「[給料が安い] （手取り18〜21万円が中央値）」. "
            "Item 2: 「[サビ残・持ち帰り仕事] が常態化している」. "
            "Item 3: 「[人間関係（園長・先輩・保護者）] のストレス」. "
            "Item 4: 「[有給がほぼ取れない／休日が少ない]」. "
            "Item 5: 「[配置基準ギリギリで余裕がない]」. "
            "(The bracketed portions [...] are highlighted with thick yellow marker. Brackets themselves should NOT appear — just the highlight.) "
            "On the upper-right area, a soft watercolor cartoon illustration of a tired-looking female childcare worker in a yellow apron "
            "with a sigh expression and a small 'tear drop' anime-style sweat bead next to her head. "
            "Below the checklist, a peach-tinted band with dark text 「※厚生労働省 保育士実態調査 等より編集部作成」. "
            "Pure cream/white background, generous padding. All Japanese text PERFECTLY ACCURATE, no typos."
        ),
    },
    "13_merit": {
        "label": "非公開求人のメリット: チェックリスト+保育士イラスト",
        "style": ILLUSTRATION_STYLE,
        "prompt": (
            "Editorial infographic-style illustration, vertical layout. "
            "Top headline in HUGE bold black brush-stroke style: 「非公開求人」 next to softer thinner script "
            "「のメリットは？」. "
            "Below the headline, 3 stacked checklist items, each separated by a thin pink dotted divider line: "
            "Each item has a large mint-green CHECK MARK ✓ icon on the left and dark Japanese text on the right, "
            "with key phrases highlighted with a soft yellow marker underline: "
            "Item 1: 「高年収などの高待遇求人は応募殺到を防ぐ為、"
            "[一部のサイトのみで案内している求人が多い]」 (the bracketed portion is yellow-marker highlighted). "
            "Item 2: 「競合他社には知られたくないような[管理職・役職候補求人も多い]」. "
            "Item 3: 「[大人気大手の超ホワイト園]の求人も多数」. "
            "On the right side, a soft watercolor cartoon illustration of a smiling young female childcare worker "
            "in pink apron, pointing index finger upward in 'tip!' pose, friendly expression. "
            "Below the checklist: a peach-tinted band with text 「※一般には公開していない高待遇求人※」 in dark text. "
            "Below the band: three coral-pink rounded pill BADGES side by side with WHITE bold text: "
            "「年収480万」「年間休日128日」「役職候補」. "
            "Pure cream/white background, generous padding. All Japanese text perfectly accurate, no typos."
        ),
    },
}


def generate(section_id: str):
    if section_id not in SECTIONS:
        sys.exit(f"unknown section: {section_id}")
    spec = SECTIONS[section_id]
    prompt = spec["prompt"] + "\n\nSTYLE: " + BRAND_STYLE + "\n\nIMAGE APPROACH: " + spec["style"]
    print(f"[{section_id}] {spec['label']} ... generating", flush=True)

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
    print(f"[{section_id}] saved -> {out} ({dt:.1f}s, {out.stat().st_size // 1024}KB)", flush=True)


GROUPS = {
    "group1": ["01_fv", "02_pain", "03_empathy"],
    "group2": ["04_about", "05_jobs", "06_strengths"],
    "group3": ["07_voices", "08_steps", "09_final"],
}


def main():
    if len(sys.argv) < 2:
        sys.exit("usage: python generate.py <fv|all|group1..3|section_id>")
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
