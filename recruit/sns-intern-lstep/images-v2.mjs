// v2 scenario banners — "clean bright" winning-ad style via gpt-image-2 (square 1024)
// Usage: node images-v2.mjs [name1 name2 ...]  (no args = all)
import fs from 'node:fs/promises';
import path from 'node:path';

const API = 'https://api.openai.com/v1/images/generations';
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1); }
const OUT = path.join(import.meta.dirname, 'images', 'v2');
await fs.mkdir(OUT, { recursive: true });

// 勝ちバナー（クリーン明るい系）の共通DNA
const STYLE = `High-converting Japanese student-recruitment ad banner, square 1:1, bright and clean. Light airy background (white with very soft pink/blue tint) with subtle sparkle (kirakira) accents and gentle bokeh. Vibrant color scheme of pink (#EC4899), blue (#3B82F6) and purple (#8B5CF6). On the right side, a real-looking cheerful young Japanese female university student in her early 20s, natural light makeup, bright genuine smile, soft flattering daylight. On the left, BOLD rounded heavy Japanese Gothic headline text with colorful pink/blue/purple gradient fills and a few hand-drawn marker underline/accent strokes. Polished, modern, energetic yet trustworthy, professional ad-design composition. CRITICAL: render every Japanese character clearly, correctly and legibly (no garbled or fake glyphs), good kerning. NO watermark, NO English paragraph text, NO extra logos.`;

const JOBS = {
  '01_welcome': `${STYLE}
Headline (stacked, very bold): 「SNS経由限定」 then big 「3つの特典」.
Add three small white rounded badges stacked, each with a pink check, reading: 「書類選考なし」「役員が直接面談」「新卒内定直結」.
Add a gold crown with a deep-pink ribbon banner reading 「就活に有利」.
A small purple pill badge 「長期インターン」 near the headline.`,

  '02_gakuchika': `${STYLE}
Headline, huge and bold, stacked: 「実践経験が」 then 「ガクチカになる」 (emphasize ガクチカ in pink gradient).
A small rising bar-chart / upward arrow motif in blue. A pink rounded pill badge 「未経験OK」 with a check. Keep it clean and punchy.`,

  '03_gentei': `${STYLE}
Headline, bold, stacked: 「今月の受け入れ枠」 then 「残りわずか」 (残りわずか in red-pink).
A small hourglass icon. A blue ribbon badge 「特別先行ルート」. Sense of gentle urgency, still bright and clean.`,

  '04_shigoto': `${STYLE}
Headline, bold: 「インターンの仕事」 then 「3つ」.
Below the headline, a row of three circular pastel icons with labels under each: a pink chat/heart bubble 「SNS企画」, a blue megaphone 「広告運用」, a purple bar-chart 「データ分析」. Three icons evenly spaced, clean.`,

  '07_suki': `${STYLE}
Headline, very large, stacked: 「好き」 then 「が、スキルになる」 (好き in big pink gradient).
A small blue handwritten-style tag 「#トレンドに敏感な学生歓迎」. Cheerful, aspirational, lots of sparkle.`,

  '05_jirei1': `${STYLE}
Headline, bold, stacked: 「先輩インターンの」 then big 「成長事例」 (成長事例 in pink gradient).
A small white rounded badge with a pink check 「未経験スタート」, and a tiny upward growth chart with 「フォロワー数万人」. Inspiring, bright.`,

  '06_skill': `${STYLE}
Headline, huge: 「時給1,250円」 then 「＋交通費全額」.
Three small rounded pill badges with checks: 「週2日〜OK」「未経験OK」「評価で昇給」. A subtle coin / sparkle money motif. Cheerful and clean.`,

  '08_koukoku': `${STYLE}
Headline, bold, stacked: 「広告代理店・マーケ」 then 「志望におすすめ」.
A rounded speech bubble reading 「業界理解も深まる！」. A small blue megaphone icon. Confident, clean.`,

  '09_jirei2': `${STYLE}
Headline: huge 「内定直結」 then 「＆ 初任給35万円〜」 (35万円 emphasized in pink gradient).
A gold crown above the headline and a subtle coin / sparkle money motif. One single small pink pill badge 「未経験スタートOK」.
IMPORTANT: do NOT add any other text, claims, numbers, percentages, or small badges beyond what is specified here. Keep it clean and uncluttered — no invented marketing copy.`,

  '10_oneday': `${STYLE}
Headline, bold, stacked: 「週2〜・学業優先」 then 「両立できる」.
A small blue calendar icon and a couple of pastel check marks. Friendly, reassuring, bright.`,

  '11_faq': `${STYLE}
This is about a paid JOB INTERNSHIP at a company. It is NOT a school or university — absolutely do NOT mention or imply admissions, entrance exams (入試), tuition (学費), scholarships (奨学金), or open campus (オープンキャンパス).
Headline, bold and large: 「よくある質問」 with a rounded 「Q&A」 mark.
Three small rounded "Q" badge rows showing exactly these short questions and nothing else: 「未経験でも大丈夫？」「学業と両立できる？」「給与はどれくらい？」.
Do NOT invent any other questions or text.`,

  '13_shimekiri': `${STYLE}
Headline, bold, stacked: 「今期枠」 then 「まもなく締切」 (締切 in strong red-pink).
A small hourglass icon and a deep-pink ribbon badge 「特別先行ルート 今だけ」. Gentle urgency, still bright and clean.`,

  '14_last': `${STYLE}
Headline, large, stacked: 「あなたの"好き"を」 then 「就活の武器に」 (武器 in pink gradient).
At the very bottom, a solid pink rounded CTA bar with white text 「エントリー受付中」 and a small white right-arrow circle. Uplifting finale, lots of sparkle.`,
};

const targets = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(JOBS);
for (const name of targets) {
  const prompt = JOBS[name];
  if (!prompt) { console.warn(`skip unknown: ${name}`); continue; }
  console.log(`→ ${name}`);
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-image-2', prompt, size: '1024x1024', n: 1 }),
  });
  if (!res.ok) { console.error(`  FAIL ${res.status}: ${await res.text()}`); continue; }
  const data = await res.json();
  await fs.writeFile(path.join(OUT, `${name}.png`), Buffer.from(data.data[0].b64_json, 'base64'));
  console.log(`  ✓ ${name}.png`);
}
console.log('done.');
