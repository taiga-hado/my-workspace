// Day-0 scenario images for 営業職ver — gpt-image-2. Usage: node images.mjs [names...]
import fs from 'node:fs/promises';
import path from 'node:path';
const API = 'https://api.openai.com/v1/images/generations';
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1); }
const OUT = path.join(import.meta.dirname, 'images');
await fs.mkdir(OUT, { recursive: true });

const Q = `\n\n— Style: Japanese recruitment LINE banner for a sales-job (営業職) career service. Palette: fresh green (#1f8a3f) as the base, bright yellow (#ffd400) for highlights and marker underlines, orange (#ff7a1a) for numbers and buttons, white cards on very light grey. Cheerful, energetic, trustworthy — NOT luxury, NOT navy/gold, NOT pink. People (if any): natural-looking Japanese people in their 20s, BOTH men and women, in office-casual clothes (light jacket, shirt, no heavy formal suit), in a bright modern office; ordinary friendly faces, not fashion models. Typography: heavy Japanese Gothic with strong size contrast, key words highlighted with a yellow marker stroke. Render EVERY Japanese character perfectly correct and clean (no garbled or invented glyphs). No English sentences, no watermark. Small text mark 「営業 by ハックツ就職」 at the top-left. Include EXACTLY the text listed and nothing else.`;

const S = { sq: '1024x1024', wide: '1536x1024' };
const JOBS = {
  // ---- carousel (wide 3:2) ----
  'c1_kyujin': { size: S.wide, prompt: `Carousel card image, almost no text: only a small yellow ribbon tag 「非公開求人」. Visual: a laptop and a smartphone on a light wooden desk in a bright modern SaaS office, the laptop showing a blurred job-listing card with an orange chip 「初年度年収500〜600万円」. Clean and uncluttered, green accent band along the bottom.${Q}` },
  'c2_shindan': { size: S.wide, prompt: `Carousel card image, no text except a small label 「営業職 転職診断」. Visual: a smartphone held in one hand showing a simple result screen with a bar chart rising from grey to orange and a green check mark; blurred bright office in the background. Clean, minimal.${Q}` },
  'c3_ca': { size: S.wide, prompt: `Carousel card image, no text except a small label 「認定キャリアアドバイザー」. Visual: an online video call on a laptop: a friendly Japanese career advisor in her late 20s in a light green jacket listening attentively; bright office, plants. Calm and trustworthy.${Q}` },

  // ---- 5min: 転職事例 ----
  '05_jirei': { size: S.sq, prompt: `Square LINE banner. Top: green header band with white text 「直近の転職事例」 and a yellow tag 「未経験から営業職へ」. Body: three white cards on light grey, each with a small round photo of a young Japanese person in office-casual clothes and text laid out as before→after with the after number big and orange:
Card1: 「Iさん・25歳女性」「アパレル販売 → インサイドセールス」「年収350万 → 470万」 yellow badge 「120万円UP」
Card2: 「Tさん・26歳男性」「訪問販売 → 法人営業」「年収380万 → 500万」 yellow badge 「120万円UP」
Card3: 「Kさん・28歳男性」「ルート営業 → SaaS営業」「年収450万 → 580万」 yellow badge 「130万円UP」
Card1 must show a young WOMAN. Below: a green strip with white text 「3人ともIT・SaaS業界は未経験スタートです」. Bottom: big rounded orange button with white text 「自分の場合を診断する ▶」. Tiny grey footnote 「※2025年度当社実績調べ。実績・条件は一例です」.${Q}` },

  // ---- 30min: 非公開求人 ----
  '30_kyujin': { size: S.sq, prompt: `Square LINE banner, information-dense but tidy. Top: yellow ribbon 「厳選」 and headline white on green 「非公開求人の一例」. Body: three white cards on light grey, each with a small photo of a bright office, the industry and company in bold green, the salary in big orange text, and three small yellow check pills:
「SaaS業界 大手S社」「初年度年収 500〜600万円」「✓未経験OK ✓土日休み ✓有給取得率高め」
「IT業界 大手K社」「初年度年収 550〜600万円」「✓未経験OK ✓上場企業 ✓残業少なめ」
「人材業界 Y社」「初年度年収 500〜600万円」「✓未経験OK ✓家賃補助 ✓残業ゼロ」
Bottom: big rounded orange button with white text 「条件に合う求人を紹介してもらう ▶」.${Q}` },

  // ---- 45min: 実績 ----
  '45_jisseki': { size: S.sq, prompt: `Square LINE banner with a bright realistic photo background: two young Japanese office workers (one man, one woman) in light jackets smiling in a modern office, green gradient overlay on the lower half. Three large gold medal badges in a row, each with white text and a huge orange number: 「平均年収」「93万円UP」 / 「入社満足度」「98%」 / 「支援実績」「1万件以上」. Above them a white line with a yellow marker stroke: 「9割以上の方が転職先に満足」. Bottom: big rounded white button with green text 「無料カウンセリングを予約する ▶」. Tiny footnote 「※2025年度当社実績調べ」.${Q}` },

  // ---- 1h: 流れ ----
  '60_nagare': { size: S.sq, prompt: `Square LINE banner, flat infographic, no photo. Headline green on white 「ご利用の流れ」 with a yellow marker stroke, and an orange sub-line 「最短1週間で内定」. A vertical timeline of five steps, each a white card with a green circled number and a small yellow tag:
1 「公式LINEから予約」 tag 「30秒でカンタン」
2 「カウンセラーとの面談」 tag 「スマホから参加OK」
3 「あなたに合う1名を紹介」 tag 「認定CA1,000人以上から」
4 「隠れホワイト企業をご紹介」 tag 「自己分析・面接対策まで」
5 「内定」 tag 「最短1週間」
Below: a green strip with three white check pills 「入社まで完全無料」「完全オンライン」「在職中のままでOK」. Bottom: big rounded orange button 「まずは予約枠を確保する ▶」.${Q}` },

  // ---- 2h: 比較表 ----
  '120_hikaku': { size: S.sq, prompt: `Square LINE banner: a clean two-column comparison table, no photo. Headline green 「きつい営業 vs ホワイトな営業」 with a yellow marker stroke. Table with a grey left column headed 「よくある営業」 and a green right column headed 「ご紹介する営業（IT・SaaS）」, four rows with the row label on the far left in a narrow band 「売り方」「休日」「残業」「初年度年収」:
売り方: 「飛び込み・テレアポ・個人宅訪問」 / 「問い合わせのあった企業に提案」
休日: 「シフト・土日出勤」 / 「土日休み」
残業: 「多い・持ち帰り」 / 「残業なし〜少なめ」
初年度年収: 「350〜450万」 / 「500〜600万円」
Right-column figures big and orange. Bottom: big rounded orange button 「ホワイト側の求人を見る ▶」.${Q}` },

  // ---- 3h: FAQ ----
  '180_faq': { size: S.sq, prompt: `Square LINE banner, tidy Q&A list, no photo. Headline green 「よくある不安に答えます」. Four white cards on light grey, each with an orange circle 「Q」 and a green circle 「A」:
Q「結局、学歴と経歴がすべてでしょ？」 A「未経験枠は人と話してきた経験を見ます」
Q「未経験は採用してないって聞くし」 A「未経験枠は非公開で動きます」
Q「ブラック企業ばかりでは？」 A「土日休み・残業・有給まで確認した会社だけ紹介します」
Q「面接でアピールできない」 A「自己分析から面接対策まで担当者が一緒に作ります」
Below: a green strip with white text 「9割の方が同じ悩みを抱えたうえで転職しています」. Bottom: big rounded orange button 「他の不安も相談する ▶」.${Q}` },

  // ---- 5h: 利用者の声 ----
  '300_koe': { size: S.sq, prompt: `Square LINE banner, testimonial layout. Headline green 「ご利用者様の声」 with a yellow marker stroke. Three white cards on light grey, each with a round photo of a young Japanese person in office-casual clothes, a bold green quote line and an orange figure on the right:
Card1 (young woman): 「未経験から憧れのSaaS営業に内定できました」 「初年度年収 500万円」
Card2 (young man): 「接客業から法人営業へ。年収も大幅アップしました」 「初年度年収 550万円」
Card3 (young woman): 「土日休み・残業少なめのホワイト企業に出会えました」 「初年度年収 600万円」
Below: a green strip with white text 「3人とも営業は未経験。決め手は“合う担当者”でした」. Bottom: big rounded orange button 「自分の場合を診断する ▶」.${Q}` },

  // ---- 7h: 担当者選び ----
  '420_ca': { size: S.sq, prompt: `Square LINE banner, two-side comparison, no large photo. Headline green 「担当者選びで、結果が変わります」 with a yellow marker stroke. Left grey panel titled 「自分で1社に登録」 with three grey ✕ lines: 「紹介される求人が担当者次第」「未経験OK枠を持っていないことも」「ノルマのきつい会社も混ざる」. Right green panel titled 「ハックツ就職経由」 with three white ✓ lines: 「認定CA1,000人以上から1名を厳選」「厳しい審査をクリアしたプロのみ」「合わなければ別の担当に変更可」. Bottom: a white strip 「合わない担当者・合わない会社は紹介しません」 then a big rounded orange button 「自分に合う1名を紹介してもらう ▶」.${Q}` },
};

const targets = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(JOBS);
for (const name of targets) {
  const job = JOBS[name]; if (!job) { console.warn('skip', name); continue; }
  console.log('→', name);
  for (let attempt = 1; attempt <= 2; attempt++) {
    const res = await fetch(API, { method: 'POST', headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-image-2', prompt: job.prompt, size: job.size, n: 1 }) });
    if (!res.ok) { console.error('  FAIL', res.status, (await res.text()).slice(0, 300)); continue; }
    const d = await res.json();
    await fs.writeFile(path.join(OUT, `${name}.png`), Buffer.from(d.data[0].b64_json, 'base64'));
    console.log('  ✓', name); break;
  }
}
console.log('done.');
