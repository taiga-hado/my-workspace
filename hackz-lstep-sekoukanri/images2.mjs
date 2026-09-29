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
  'd02_shikaku': { size: S.sq, prompt: `Square LINE banner, flat infographic, no large photo. Headline green 「資格は、入ってから取ればいい」 with a yellow marker stroke. Body: two white cards on light grey. Card A titled 「入社時に必要な資格」 with one big orange word 「なし」. Card B titled 「入社後に会社負担で取る人が大半」 with three yellow check pills 「2級施工管理技士」「受験費用も会社負担」「講座も会社負担」. Small illustration of a yellow hard hat and a certificate. Bottom: rounded orange button 「資格支援ありの求人を見る ▶」.${Q}` },
  'd03_jirei24': { size: S.sq, prompt: `Square LINE banner. Headline green 「事例｜24歳・フリーターから施工管理へ」. Left: a photo of a friendly Japanese man about 24 in a yellow hard hat and work vest on a sunny building site. Right: a before/after bar chart, grey bar 「年収260万」 and a tall orange bar 「420万」, with a yellow round badge 「160万円UP」. Below: three yellow check pills 「未経験スタート」「資格取得支援あり」「土日祝休み」. Bottom: rounded orange button 「自分の場合を診断する ▶」. Tiny footnote 「※2025年度当社実績調べ。実績・条件は一例です」.${Q}` },
  'd05_ichinichi': { size: S.sq, prompt: `Square LINE banner, timeline infographic, no large photo. Headline green 「施工管理の1日」 with a yellow marker stroke and an orange sub-line 「現場作業ではなく、管理と書類が中心」. A vertical timeline of six white cards, each with a green time chip and a short label:
「8:00」「朝礼」 / 「9:00」「進捗確認・写真撮影」 / 「12:00」「昼休み」 / 「13:00」「書類・工程表」 / 「16:00」「翻日の段取り」 / 「17:30」「退社」
Bottom green strip 「残業なしの会社は“段取り”で決まります」 then a rounded orange button 「残業なしの求人を見る ▶」.${Q}` },
  'd09_kyujitsu': { size: S.sq, prompt: `Square LINE banner, comparison, no large photo. Headline green 「年間休日120日の会社は実在します」 with a yellow marker stroke. Two white cards side by side: left grey-toned card 「年間休日105日前後」 with a grey line 「土曜は基本出勤」; right green-bordered card 「年間休日120日」 with white-on-green lines 「土日祝休み」「夏季・冬季休暇あり」. Below a yellow note strip 「求人票の「週休2日制」だけでは見分けられません」. Bottom: rounded orange button 「年間休日120日の求人を見る ▶」.${Q}` },
  'd12_faq2': { size: S.sq, prompt: `Square LINE banner, tidy Q&A list, no photo. Headline green 「よくある質問 第2弾」. Four white cards on light grey, each with an orange circle 「Q」 and a green circle 「A」:
Q「体力に自信がない」 A「現場作業ではなく管理と書類が中心です」
Q「転勤が不安」 A「地域限定・転勤なしの求人を優先します」
Q「学歴が不安」 A「学歴不問の未経験枠があります」
Q「転職回数が多い」 A「人手不足のためほぼ問われません」
Bottom: rounded orange button 「他の不安も相談する ▶」.${Q}` },
  'd17_ca': { size: S.sq, prompt: `Square LINE banner. Headline green 「認定キャリアアドバイザーの中身」 with a yellow marker stroke. Three white profile cards in a row, each with a round photo of a Japanese career advisor (two women, one man, late 20s to 30s, office casual) and two lines:
「鈴木様」「大手人材紹介会社 / エージェント歰4年」
「渡辺様」「大手企業の人事部門 / 6年」
「菅野様」「人材系メガベンチャー / 5年」
Below a green strip with white text 「厳しい審査をクリアした1,000人以上から、1名を厳選」. Bottom: rounded orange button 「自分に合う1名を紹介してもらう ▶」.${Q}` },
  'd19_kosho': { size: S.sq, prompt: `Square LINE banner, comparison, no large photo. Headline green 「年収交渉は担当者が代行します」 with a yellow marker stroke. Two white cards: left grey card 「自分で交渉」 with a flat grey arrow and the words 「提示額のまま」; right green card 「担当者経由」 with a rising orange arrow and a huge orange figure 「平均 +93万円」. Below a yellow note strip 「未経験入社でも交渉の余地はあります」. Bottom: rounded orange button 「交渉込みで求人を紹介してもらう ▶」. Tiny footnote 「※2025年度当社実績調べ」.${Q}` },
  'd20_seikoritsu': { size: S.sq, prompt: `Square LINE banner, bar chart, no photo. Headline green 「転職成功率が3倍以上」 with a yellow marker stroke. Three vertical bars on white with labels under them and percentage figures above:
grey short bar 「転職サイト」「3.8%」 / medium grey-green bar 「転職エージェント」「10.2%」 / tall green bar with a gold crown 「ハックツ就職」「31.2%」 (this figure huge and orange).
Below a green strip with white text 「1人で転職活動するより成功率が上がります」. Bottom: rounded orange button 「プロと一緒に進める ▶」. Tiny footnote 「※2025年度当社実績調べ」.${Q}` },
  'd22_gonengo': { size: S.sq, prompt: `Square LINE banner, two-side comparison, no large photo. Headline green 「5年後の比較」 with a yellow marker stroke. Left grey panel 「今のまま」 with three grey lines 「時給・体力頼み」「年収は横ばい」「選べる求人が減る」. Right green panel 「施工管理」 with three white lines 「資格と経験で年収が積み上がる」「管理職も視野に」「長く働ける」. A small line chart in the right panel rising from grey to orange. Bottom strip 「分かれ道は20代のうち」 then a rounded orange button 「5年後の年収を診断する ▶」.${Q}` },
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
