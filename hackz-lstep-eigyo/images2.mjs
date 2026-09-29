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
  'd02_shurui': { size: S.sq, prompt: `Square LINE banner, flat infographic, no large photo. Headline green 「営業は4種類あります」 with a yellow marker stroke. Four white rows on light grey, the first three with a grey cross icon and the last with a big green check and a green border:
「個人宅への訪問販売」「断られ続ける」
「テレアポ中心の新規」「断られ続ける」
「ルート営業」「年収が上がりにくい」
「法人向けIT・SaaS営業 / インサイドセールス」「問い合わせのあった企業に提案」
Bottom green strip 「ご紹介するのは一番下だけです」 then a rounded orange button 「ホワイト側の求人を見る ▶」.${Q}` },
  'd03_jirei25': { size: S.sq, prompt: `Square LINE banner. Headline green 「事例｜25歳女性・アパレル販売からインサイドセールスへ」. Left: a photo of a friendly Japanese woman about 25 in office-casual clothes at a bright desk with a laptop and a headset. Right: a before/after bar chart, grey bar 「年収350万」 and a tall orange bar 「470万」, with a yellow round badge 「120万円UP」. Below: three yellow check pills 「立ち仕事→内勤」「シフト→土日休み」「IT・SaaSは未経験から」. Bottom: rounded orange button 「自分の場合を診断する ▶」. Tiny footnote 「※2025年度当社実績調べ。実績・条件は一例です」.${Q}` },
  'd04_ichinichi': { size: S.sq, prompt: `Square LINE banner, timeline infographic, no large photo. Headline green 「インサイドセールスの1日」 with a yellow marker stroke and an orange sub-line 「飛び込み・個人宅訪問なし」. A vertical timeline of six white cards, each with a green time chip and a short label:
「9:30」「出社・メール」 / 「10:00」「問い合わせ企業とオンライン商談」 / 「12:00」「昼休み」 / 「13:00」「提案資料作成」 / 「15:00」「商談2件」 / 「18:30」「退社」
Bottom green strip 「土日休み・残業少なめの求人を選んでいます」 then a rounded orange button 「この働き方の求人を見る ▶」.${Q}` },
  'd09_mikiwame': { size: S.sq, prompt: `Square LINE banner, checklist, no large photo. Headline green 「ホワイト企業の見分け方3点」 with a yellow marker stroke. Three white cards on light grey, each with a big green check circle and a bold green line plus a small grey note:
「有給取得率を公開しているか」「数字で出せない会社は除外」
「残業時間の実績値を出せるか」「規定ではなく実績」
「インセンティブ比率が高すぎないか」「売れない月の落ち込みが大きい」
Bottom green strip 「求人票からは分かりません。担当者が実データで確認します」 then a rounded orange button 「確認済みの求人だけ見る ▶」.${Q}` },
  'd12_faq2': { size: S.sq, prompt: `Square LINE banner, tidy Q&A list, no photo. Headline green 「よくある質問 第2弾」. Four white cards on light grey, each with an orange circle 「Q」 and a green circle 「A」:
Q「ノルマが不安」 A「ノルマ比率の低い求人を選べます」
Q「PCスキルが不安」 A「入社後の研修前提の未経験枠です」
Q「学歴が不安」 A「学歴不問の求人があります」
Q「転職回数が多い」 A「3回までなら大半が対象です」
Bottom: rounded orange button 「他の不安も相談する ▶」.${Q}` },
  'd17_ca': { size: S.sq, prompt: `Square LINE banner. Headline green 「認定キャリアアドバイザーの中身」 with a yellow marker stroke. Three white profile cards in a row, each with a round photo of a Japanese career advisor (two women, one man, late 20s to 30s, office casual) and a short credential line:
「大手人材紹介会社出身」「エージェント歰4年」
「大手企業の人事部門出身」「6年」
「人材系メガベンチャー出身」「5年」
Below a green strip with white text 「厳しい審査をクリアした1,000人以上から、1名を厳選」. Bottom: rounded orange button 「自分に合う1名を紹介してもらう ▶」.${Q}` },
  'd19_kosho': { size: S.sq, prompt: `Square LINE banner, comparison, no large photo. Headline green 「年収交渉は担当者が代行します」 with a yellow marker stroke. Two white cards: left grey card 「自分で交渉」 with a flat grey arrow and the words 「提示額のまま」; right green card 「担当者経由」 with a rising orange arrow and a huge orange figure 「平均 +93万円」. Below a yellow note strip 「未経験入社でも交渉の余地はあります」. Bottom: rounded orange button 「交渉込みで求人を紹介してもらう ▶」. Tiny footnote 「※2025年度当社実績調べ」.${Q}` },
  'd20_isshukan': { size: S.sq, prompt: `Square LINE banner, week timeline, no large photo. Headline green 「最短1週間で内定した人の進み方」 with a yellow marker stroke. Five white cards in a vertical timeline, each with a green weekday chip:
「月」「LINE面談 30分」 / 「火」「担当者から求人提案」 / 「水・木」「面接（オンライン）」 / 「金」「内定」 with an orange badge. Bottom green strip 「急ぐ必要はありませんが、進められる体制です」 then a rounded orange button 「最短で進めたいと伝える ▶」.${Q}` },
  'd22_gonengo': { size: S.sq, prompt: `Square LINE banner, two-side comparison, no large photo. Headline green 「5年後の比較」 with a yellow marker stroke. Left grey panel 「今のまま」 with three grey lines 「接客・シフト勤務」「年収は横ばい」「土日は休めない」. Right green panel 「IT・SaaS営業」 with three white lines 「内勤・土日休み」「スキルで年収が積み上がる」「マネージャーも視野に」. A small line chart in the right panel rising from grey to orange. Bottom strip 「分かれ道は20代のうち」 then a rounded orange button 「5年後の年収を診断する ▶」.${Q}` },
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
