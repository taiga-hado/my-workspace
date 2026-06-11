// Generate LSTEP FLEX hero images via OpenAI gpt-image-2 (portrait cards)
// Usage: node flex-images.mjs [name1 name2 ...]
import fs from 'node:fs/promises';
import path from 'node:path';

const API = 'https://api.openai.com/v1/images/generations';
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1); }

const OUT = path.join(import.meta.dirname, 'images', 'flex');
await fs.mkdir(OUT, { recursive: true });

// 共通スタイル（インターンLP・トレンド訴求版と統一）
const STYLE = `Elegant Japanese editorial magazine card design for a LINE flex message hero (vertical card). Warm ivory background (#FAF7F2), terracotta (#C2674A) and muted gold (#D9A86C) accents, deep espresso brown (#211A13) text. Refined Japanese Mincho (serif) typography, thin gold hairline borders/frame, generous whitespace, small italic serif English accent words. Sophisticated, aimed at stylish female university students. Flat graphic design, NO photographs, NO human faces, NO emoji. All Japanese text must be rendered clearly, correctly and legibly.`;

const SIZE = '1024x1536';

const JOBS = {
  flex_welcome: {
    prompt: `${STYLE}
Vertical card layout:
- Top: small "HADO" wordmark, and italic serif label "WELCOME" in gold
- Center, large Mincho serif (espresso brown): "友だち登録 ありがとうございます"
- A gold outlined badge/ribbon with text: "LINE友だち限定 特別選考ルートにご招待"
- One line smaller: "SNSのトレンドを、つくる側へ。"
- Bottom: a terracotta solid rounded button shape with white text "今すぐエントリー" and a small right arrow
- Thin gold hairline frame around the whole card`,
  },
  flex_ticket1: {
    prompt: `${STYLE}
Vertical card styled like an elegant admission TICKET / boarding pass:
- A horizontal perforation line in gold dots across the card, small gold circle notches on both side edges
- Top section italic serif label "SPECIAL TICKET" + large serif number "01" in gold
- Main Mincho serif text (espresso brown): "書類選考なしの 特別先行ルート"
- Sub line in terracotta: "SNS経由でご登録のあなただけに"
- Bottom small text: "カジュアル面談・オンラインOK"
- Thin gold hairline frame`,
  },
  flex_ticket2: {
    prompt: `${STYLE}
Vertical card styled like an elegant admission TICKET / boarding pass (same series as ticket 01):
- A horizontal perforation line in gold dots, small gold circle notches on both side edges
- Top section italic serif label "SPECIAL TICKET" + large serif number "02" in gold
- Main Mincho serif text (espresso brown): "役員が直接担当 内定直結ルート"
- Sub line in terracotta: "通常選考より、ぐっと近道に"
- Bottom small text: "まずは30分、話を聞くだけでOK"
- Thin gold hairline frame`,
  },
  flex_growth: {
    prompt: `${STYLE}
Vertical card layout, theme = growth / career:
- Top italic serif label "GROWTH" in gold
- Main Mincho serif text (espresso brown), large: "未経験から、 つくる側へ。"
- A subtle elegant ascending thin-line growth chart / upward arrow drawn in pale gold strokes in the background
- Three short rows with thin gold bullet lines: "平均年齢23歳のチーム" / "研修3ヶ月はマンツーマン" / "ガクチカが『自分の実績』に"
- Thin gold hairline frame`,
  },
  flex_company: {
    prompt: `${STYLE}
Vertical card layout, theme = company introduction:
- Top center "HADO" wordmark, italic serif label "ABOUT US" in gold
- Main Mincho serif heading (espresso brown): "HADOって どんな会社？"
- Body lines in espresso brown, calm and clean:
  "SNSマーケティングを軸に"
  "様々な事業を生み出す開発会社。"
  "拠点は、東京・中目黒と福岡。"
- A small italic serif tagline in terracotta at bottom: "世界を前に進める表現者へ"
- Thin gold hairline frame`,
  },
};

const targets = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(JOBS);

for (const name of targets) {
  const job = JOBS[name];
  if (!job) { console.warn(`skip unknown: ${name}`); continue; }
  console.log(`→ ${name} (${SIZE})`);
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-image-2', prompt: job.prompt, size: SIZE, n: 1 }),
  });
  if (!res.ok) { console.error(`  FAIL ${res.status}: ${await res.text()}`); continue; }
  const data = await res.json();
  const b64 = data.data[0].b64_json;
  const file = path.join(OUT, `${name}.png`);
  await fs.writeFile(file, Buffer.from(b64, 'base64'));
  console.log(`  ✓ ${file}`);
}
console.log('done.');
