// Generate LSTEP banner images via OpenAI gpt-image-2
// Usage: node generate-images.mjs [name1 name2 ...]
import fs from 'node:fs/promises';
import path from 'node:path';

const API = 'https://api.openai.com/v1/images/generations';
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1); }

const OUT = path.join(import.meta.dirname, 'images');
await fs.mkdir(OUT, { recursive: true });

// 共通スタイル（インターンLP・トレンド訴求版と統一）
const STYLE = `Elegant Japanese editorial magazine banner design. Warm ivory background (#FAF7F2), terracotta (#C2674A) and muted gold (#D9A86C) accent colors, deep espresso brown (#211A13) text. Refined Japanese Mincho (serif) typography, thin gold hairline borders, generous whitespace, subtle italic serif English accent words. Premium, sophisticated, aimed at stylish female university students. Flat graphic design, no photographs, no human faces, no emoji. All Japanese text must be rendered clearly, correctly and legibly.`;

const JOBS = {
  welcome_tokuten: {
    size: '1536x1024',
    prompt: `${STYLE}
Banner layout:
- Top center: small italic serif English label "SPECIAL BENEFITS" in gold, letter-spaced
- Main title (large, Mincho serif, espresso brown): "SNS経由限定 3つの特典"
- Below, three horizontal rows, each with a gold circled number and Japanese text:
  "01　書類選考なしの特別先行ルート"
  "02　カジュアル面談から役員が直接担当"
  "03　新卒採用への内定直結ルートあり"
- Bottom center: small terracotta text "カジュアル面談・オンラインOK"
- Thin gold hairline frame around the whole banner`,
  },
  limited_2days: {
    size: '1536x1024',
    prompt: `${STYLE}
Banner layout:
- Top center: small italic serif English label "LIMITED OFFER" in gold, letter-spaced
- Center, very large Mincho serif text in espresso brown: "募集は2日間限定"
- The characters "2日間" emphasized in terracotta, slightly larger
- Below: one line of smaller Japanese text "今月のインターン受け入れ枠が埋まり次第、締切となります"
- Bottom center: small gold text "カジュアル面談 30分・オンラインOK"
- Thin gold hairline frame, an elegant small hourglass line-icon drawn with thin gold strokes above the title`,
  },
  seicho_jirei: {
    size: '1536x1024',
    prompt: `${STYLE}
Banner layout:
- Top center: small italic serif English label "REAL STORIES" in gold, letter-spaced
- Main title (large Mincho serif, espresso brown): "先輩インターンのリアル"
- Subtitle in terracotta Mincho: "未経験から、つくる側へ。"
- Below, three short rows with thin gold bullet lines and Japanese text:
  "慶應大2年・未経験からチームリーダーに"
  "19歳で役員に昇格したメンバーも"
  "ガクチカが『自分の実績』に変わる"
- Thin gold hairline frame, subtle upward thin-line growth chart motif in the background in pale gold`,
  },
  shigoto_naiyo: {
    size: '1536x1024',
    prompt: `${STYLE}
Banner layout:
- Top center: small italic serif English label "WHAT YOU DO" in gold, letter-spaced
- Main title (large Mincho serif, espresso brown): "インターンの仕事内容"
- Below, three vertical columns separated by thin gold hairlines, each with a gold serif number and two lines of Japanese text:
  "01" / "企画・コンテンツ制作" / "トレンドを企画に変える"
  "02" / "運用・広告配信" / "投稿を伸ばして検証する"
  "03" / "分析・改善提案" / "数字で語れる人になる"
- Thin gold hairline frame around the whole banner`,
  },
  faq: {
    size: '1536x1024',
    prompt: `${STYLE}
Banner layout:
- Top center: small italic serif English label "Q & A" in gold, letter-spaced
- Main title (large Mincho serif, espresso brown): "よくある質問"
- Subtitle line in espresso brown: "給与・学業との両立・未経験・内定直結…ぜんぶ答えます"
- Decorative oversized thin-stroke serif "Q" and "A" letterforms in pale gold placed asymmetrically in the background
- Bottom center: small terracotta text "不安なことは、面談で気軽に聞いてください"
- Thin gold hairline frame`,
  },
};

const targets = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(JOBS);

for (const name of targets) {
  const job = JOBS[name];
  if (!job) { console.warn(`skip unknown: ${name}`); continue; }
  console.log(`→ ${name} (${job.size})`);
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-image-2',
      prompt: job.prompt,
      size: job.size,
      n: 1,
    }),
  });
  if (!res.ok) {
    console.error(`  FAIL ${res.status}: ${await res.text()}`);
    continue;
  }
  const data = await res.json();
  const b64 = data.data[0].b64_json;
  const file = path.join(OUT, `${name}.png`);
  await fs.writeFile(file, Buffer.from(b64, 'base64'));
  console.log(`  ✓ ${file}`);
}
console.log('done.');
