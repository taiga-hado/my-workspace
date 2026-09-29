// Day-0 scenario images for 施工管理ver — gpt-image-2. Usage: node images.mjs [names...]
import fs from 'node:fs/promises';
import path from 'node:path';
const API = 'https://api.openai.com/v1/images/generations';
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1); }
const OUT = path.join(import.meta.dirname, 'images');
await fs.mkdir(OUT, { recursive: true });

const Q = `\n\n— Style: Japanese recruitment LINE banner for a construction-site-management (施工管理) career service. Palette: fresh green (#1f8a3f) as the base, bright yellow (#ffd400) for highlights and marker underlines, orange (#ff7a1a) for numbers and buttons, white cards on very light grey. Cheerful, energetic, trustworthy — NOT luxury, NOT navy/gold, NOT pink. Motif: yellow hard hat. People (if any): natural-looking Japanese people in their 20s, BOTH men and women, wearing a yellow hard hat and work vest or plain casual clothes, on a real construction site or in a bright office; ordinary friendly faces, not fashion models. Typography: heavy Japanese Gothic with strong size contrast, key words highlighted with a yellow marker stroke. Render EVERY Japanese character perfectly correct and clean (no garbled or invented glyphs). No English sentences, no watermark. Small text mark 「施工管理 by ハックツ就職」 at the top-left. Include EXACTLY the text listed and nothing else.`;

const S = { sq: '1024x1024', wide: '1536x1024' };
const JOBS = {
  // ---- carousel (wide 3:2) ----
  'c1_kyujin': { size: S.wide, prompt: `Carousel card image, almost no text: only a small yellow ribbon tag 「非公開求人」. Visual: a yellow hard hat resting on a set of rolled construction drawings on a desk, beside a tablet showing a blurred job-listing card with an orange chip 「年収500万円以上」. Bright daylight, clean and uncluttered, green accent band along the bottom.${Q}` },
  'c2_shindan': { size: S.wide, prompt: `Carousel card image, no text except a small label 「施工管理 転職診断」. Visual: a smartphone held in one hand showing a simple result screen with a bar chart rising from grey to orange and a green check mark; blurred construction site in the background. Clean, minimal.${Q}` },
  'c3_ca': { size: S.wide, prompt: `Carousel card image, no text except a small label 「認定キャリアアドバイザー」. Visual: an online video call on a laptop: a friendly Japanese career advisor in her late 20s in a light green jacket listening attentively; bright office, plants. Calm and trustworthy.${Q}` },

  // ---- 5min: 転職事例 ----
  '05_jirei': { size: S.sq, prompt: `Square LINE banner. Top: green header band with white text 「直近の転職事例」 and a yellow tag 「未経験から施工管理へ」. Body: three white cards on light grey, each with a small round photo of a young Japanese person in a yellow hard hat and text laid out as before→after with the after number big and orange:
Card1: 「Iさん・24歳男性」「フリーター → 施工管理」「年収260万 → 420万」 yellow badge 「160万円UP」
Card2: 「Sさん・25歳女性」「飲食店 → 施工管理」「年収300万 → 400万」 yellow badge 「100万円UP」
Card3: 「Kさん・29歳男性」「中小建設会社 → 大手ゼネコン」「年収520万 → 700万」 yellow badge 「180万円UP」
Card2 must show a young WOMAN in a hard hat. Below: a green strip with white text 「正社員経験なしからの転職もあります」. Bottom: big rounded orange button with white text 「自分の場合を診断する ▶」. Tiny grey footnote 「※2025年度当社実績調べ。実績・条件は一例です」.${Q}` },

  // ---- 30min: 非公開求人 ----
  '30_kyujin': { size: S.sq, prompt: `Square LINE banner, information-dense but tidy. Top: yellow ribbon 「厳選」 and headline white on green 「施工管理の非公開求人」. Body: four white rows on light grey, each with the company type in bold green, the salary change with the after figure big and orange, and two or three small yellow check pills:
「大手ゼネコン」「420万 → 680万」「✓大規模プロジェクト ✓出張手当あり ✓年間休日120日」
「準大手ゼネコン」「380万 → 550万」「✓未経験OK ✓資格取得支援 ✓残業なし」
「大手プラント・インフラ」「400万 → 620万」「✓安定した受注 ✓寮・社宅あり」
「官公庁・自治体関連」「360万 → 520万」「✓公共工事中心 ✓ワークライフバランス」
Bottom: big rounded orange button with white text 「条件に合う求人を紹介してもらう ▶」.${Q}` },

  // ---- 45min: 実績 ----
  '45_jisseki': { size: S.sq, prompt: `Square LINE banner with a bright realistic photo background: two young Japanese construction-site managers (one man, one woman) in yellow hard hats smiling on a sunny building site, green gradient overlay on the lower half. Three large gold medal badges in a row, each with white text and a huge orange number: 「平均年収」「93万円UP」 / 「入社満足度」「98%」 / 「支援実績」「1万件以上」. Above them a white line with a yellow marker stroke: 「9割以上の方が転職先に満足」. Bottom: big rounded white button with green text 「無料カウンセリングを予約する ▶」. Tiny footnote 「※2025年度当社実績調べ」.${Q}` },

  // ---- 1h: 流れ ----
  '60_nagare': { size: S.sq, prompt: `Square LINE banner, flat infographic, no photo. Headline green on white 「ご利用の流れ」 with a yellow marker stroke, and an orange sub-line 「最短1週間で内定」. A vertical timeline of five steps, each a white card with a green circled number and a small yellow tag:
1 「公式LINEから予約」 tag 「30秒でカンタン」
2 「カウンセラーとの面談」 tag 「スマホから参加OK」
3 「あなたに合う1名を紹介」 tag 「認定CA1,000人以上から」
4 「隠れホワイト企業をご紹介」 tag 「書類・面接まで支援」
5 「内定」 tag 「最短1週間」
Below: a green strip with three white check pills 「入社まで完全無料」「完全オンライン」「在職中のままでOK」. Bottom: big rounded orange button 「まずは予約枠を確保する ▶」.${Q}` },

  // ---- 2h: 比較表 ----
  '120_hikaku': { size: S.sq, prompt: `Square LINE banner: a clean two-column comparison table, no photo. Headline green 「今のまま vs 施工管理に転職後」. Table with a grey left column headed 「今のまま」 and a green right column headed 「施工管理に転職後」, four rows with the row label on the far left in a narrow band 「年収」「休日」「残業」「5年後」:
年収: 「260〜400万」 / 「500万円以上」
休日: 「シフト・土日出勤」 / 「土日祝休み・年間休日120日」
残業: 「多い・不規則」 / 「残業なし」
5年後: 「時給・体力頼み」 / 「資格と経験で年収が上がる」
Right-column figures big and orange. Bottom: big rounded orange button 「転職後の年収を診断する ▶」.${Q}` },

  // ---- 3h: FAQ ----
  '180_faq': { size: S.sq, prompt: `Square LINE banner, tidy Q&A list, no photo. Headline green 「よくある不安に答えます」. Four white cards on light grey, each with an orange circle 「Q」 and a green circle 「A」:
Q「結局、資格と経験がすべてでしょ？」 A「未経験OK・資格取得支援ありの求人があります」
Q「未経験は採用してないって聞くし」 A「未経験枠は非公開で動きます」
Q「施工管理はきつい職場ばかり？」 A「年間休日120日・残業なしの会社を選べます」
Q「書類選考が通らない」 A「履歴書から面接対策まで担当者が一緒に進めます」
Below: a green strip with white text 「9割の方が同じ悩みを抱えたうえで転職しています」. Bottom: big rounded orange button 「他の不安も相談する ▶」.${Q}` },

  // ---- 5h: 変わること ----
  '300_kurashi': { size: S.sq, prompt: `Square LINE banner with a warm realistic photo background: a young Japanese man in his mid-20s relaxing on a weekend day out with friends, casual clothes, bright and cheerful; green gradient overlay on the lower half. Headline in white with a yellow marker stroke 「年収500万円・土日祝休みで変わること」. Five white pill tags with green check icons in two rows: 「土日に予定を入れられる」「帰って寝るだけの生活が終わる」「資格が増えて市場価値が上がる」「寮・家賃補助のある会社も」「毎月の貯金ができる」. One white line: 「未経験から施工管理に移った20代の、平均的な変化です」. Bottom: big rounded orange button 「自分の場合を診断する ▶」.${Q}` },

  // ---- 7h: 担当者選び ----
  '420_ca': { size: S.sq, prompt: `Square LINE banner, two-side comparison, no large photo. Headline green 「担当者選びで、結果が変わります」 with a yellow marker stroke. Left grey panel titled 「自分で1社に登録」 with three grey ✕ lines: 「紹介される求人が担当者次第」「未経験OK枠を持っていないことも」「現場のリアルを知らない」. Right green panel titled 「ハックツ就職経由」 with three white ✓ lines: 「認定CA1,000人以上から1名を厳選」「厳しい審査をクリアしたプロのみ」「合わなければ別の担当に変更可」. Under the right panel three tiny circular portraits of Japanese career advisors (two women, one man) with labels 「大手人材紹介 4年」「大手企業人事 6年」「メガベンチャー 5年」. Bottom: a white strip 「合わない担当者・合わない会社は紹介しません」 then a big rounded orange button 「自分に合う1名を紹介してもらう ▶」.${Q}` },
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
