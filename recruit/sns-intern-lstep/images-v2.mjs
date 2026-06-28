// v2 scenario banners — each image has its OWN distinct design direction (varied tone & manner).
// gpt-image-2, square 1024. Usage: node images-v2.mjs [name1 name2 ...]  (no args = all)
import fs from 'node:fs/promises';
import path from 'node:path';

const API = 'https://api.openai.com/v1/images/generations';
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1); }
const OUT = path.join(import.meta.dirname, 'images', 'v2');
await fs.mkdir(OUT, { recursive: true });

// Shared quality/safety footer ONLY (no shared visual DNA — every image looks different).
const Q = `\n\n— This is a recruitment ad banner for a PAID long-term SNS-marketing internship at a Japanese company. Target audience: stylish urban Japanese female university students in their early 20s. Square 1:1 (1024x1024). Render every Japanese character perfectly legible, correct and clean (NO garbled or fake glyphs), with good kerning and balance. Polished, high-converting, professional design. NO watermark, NO English paragraph text, NO unrelated logos. Do NOT imply it is a school/university (no entrance exams, tuition, scholarships, open campus).`;

const JOBS = {
  // 1) Warm celebratory WELCOME — gift & confetti, cream/coral/champagne-gold, graphic-led with a small round photo
  '01_welcome': `Cheerful WELCOME ad banner with a celebratory gift theme. Warm cream/ivory background with floating pastel gift boxes, ribbons, confetti and soft gold sparkle. Color palette: warm coral-pink, champagne gold and cream (NOT the typical pink-blue-purple). Friendly rounded soft typography. Big stacked headline 「SNS経由限定」 then larger 「3つの特典」. Three small white rounded badges with coral checks: 「書類選考なし」「役員が直接面談」「新卒内定直結」. A gold crown with a coral ribbon banner 「就活に有利」. Optionally a small circular cut-out photo of a smiling young Japanese woman as an accent (not dominant). Warm, generous, inviting.${Q}`,

  // 2) GAKUCHIKA — editorial "job-hunting handbook" look, navy & white, ES/notebook motif, intellectual, minimal photo
  '02_gakuchika': `Clean EDITORIAL "job-hunting handbook" style banner. Crisp white / off-white paper background with thin ruled notebook lines and a tidy entry-sheet (ES) / résumé document motif, a fountain pen and a small rising line-graph drawn in ink. Restrained palette: deep navy, charcoal and a single warm accent (mustard or coral) — calm and intellectual, NOT pastel-cute. Sharp modern Mincho/Gothic mixed typography. Headline (stacked): 「実践経験が」 then big 「ガクチカになる」 (ガクチカ in the accent color). Small tidy tag 「未経験OK」. Smart, credible, magazine-like. No large portrait photo — keep it graphic and editorial.${Q}`,

  // 3) GENTEI / scarcity — ticket-stub urgency, red-orange & cream, bold, no portrait
  '03_gentei': `Bold LIMITED-SLOTS urgency banner styled as a torn admission TICKET / coupon stub. Cream/kraft background with a big rounded ticket shape, perforated edge and a small hourglass. High-energy palette: vivid red-orange, deep red and cream (NO blue/purple). Heavy condensed Japanese poster typography. Headline (stacked): 「今月の受け入れ枠」 then huge 「残りわずか」 (残りわずか in strong red). A clean ribbon badge 「特別先行ルート」. Urgent but premium and tidy — like a limited-event flyer. No human photo.${Q}`,

  // 4) SHIGOTO — flat infographic, mint/teal, three icons, illustration only
  '04_shigoto': `Flat-design INFOGRAPHIC banner, illustration only (NO photo). Soft mint and teal background with white cards, clean modern flat-vector style, very tidy SaaS-like look. Top headline 「インターンの仕事」 then 「3つ」. Three evenly-spaced rounded flat icons in a row, each on its own pastel card with a label below: a coral chat/heart bubble 「SNS企画」, a teal megaphone 「広告運用」, a navy bar-chart 「データ分析」. Geometric, calm, organized, professional flat illustration. Friendly rounded sans typography.${Q}`,

  // 5) JIREI1 — magazine portrait, big real photo, beige/terracotta editorial, interview quote
  '05_jirei1': `Editorial MAGAZINE-INTERVIEW portrait banner. A large, real, natural candid photo of a cheerful young Japanese female university student (early 20s) occupying most of the frame, soft warm window light, film-like tones. Warm editorial palette: beige, terracotta, cream — like a fashion/culture magazine spread. Elegant serif + clean sans typography laid over a soft translucent band. Headline 「先輩インターンの成長事例」 with a small magazine-style pull-quote feel. A small tidy tag 「未経験スタート」. Sophisticated, real, aspirational — photo-dominant, minimal graphics.${Q}`,

  // 6) SKILL / pay — pop sale-flyer, yellow & magenta, coins, energetic, graphic-led
  '06_skill': `Energetic POP "great deal" flyer banner. Bright sunny yellow background with bold magenta and white, halftone dots, starbursts and floating gold coins/sparkles — playful retail-sale energy (NO calm pastels). Chunky bold rounded poster typography with thick outlines. Huge headline 「時給1,250円」 then 「＋交通費全額」. Three rounded pill badges with checks: 「週2日〜OK」「未経験OK」「評価で昇給」. Fun, punchy, high-contrast pop design. Optionally a tiny thumbs-up or coin mascot, no big portrait.${Q}`,

  // 7) SUKI — Gen-Z / Y2K social-media aesthetic, purple-pink gradient, phone + UI, sparkle
  '07_suki': `Trendy Gen-Z / Y2K SOCIAL-MEDIA aesthetic banner. Glossy gradient background (lilac → hot pink → electric blue) with chrome/holographic accents, sparkle stars, and floating social-app UI elements (like/heart icons, a stylized smartphone showing a feed). Bubbly chrome-bevel Y2K typography. Big stacked headline 「好き」 then 「が、スキルになる」 (好き huge with glossy gradient). A handwritten-style tag 「#トレンドに敏感な学生歓迎」. Optional small photo of a young woman holding a phone. Playful, hyper-online, fashionable.${Q}`,

  // 8) KOUKOKU — corporate-cool, dark navy + electric blue, sharp & professional, business setting
  '08_koukoku': `Sleek CORPORATE-COOL banner for ad-agency / marketing aspirants. Dark navy-to-black gradient background with sharp electric-blue and cyan accent lines, a subtle data-dashboard / city-night grid motif. Clean confident modern sans typography in white and cyan — serious and career-focused, NOT cute. Headline (stacked): 「広告代理店・マーケ」 then 「志望におすすめ」. A crisp speech-bubble 「業界理解も深まる！」 and a small line-style megaphone icon. Optionally a young Japanese woman in smart business attire, cool blue lighting. Professional, premium, sharp.${Q}`,

  // 9) JIREI2 — luxe navy + gold minimal, elegant, aspirational, success
  '09_jirei2': `Premium LUXE minimal banner about future success and pay. Deep midnight-navy background with refined gold foil accents, thin elegant lines, subtle sparkle — upscale and calm (lots of negative space, very uncluttered). Elegant high-contrast serif typography in gold and white. Headline: large 「内定直結」 then 「初任給35万円〜」 (35万円 in gold). A small minimalist gold crown accent. Exactly one tidy pill badge 「未経験スタートOK」. Sophisticated, aspirational, restrained — do NOT add any other text, numbers, percentages or badges.${Q}`,

  // 10) ONEDAY — pastel planner / lifestyle, lavender & cream, hand-drawn cute, calendar
  '10_oneday': `Soft LIFESTYLE planner banner. Cozy cream and lavender background with a cute hand-drawn weekly planner / calendar, washi-tape, a coffee cup, little doodle stars and check marks — warm, organized, reassuring (gentle hand-drawn illustration style, NO bold poster look). Rounded friendly handwritten-ish typography. Headline (stacked): 「週2〜・学業優先」 then 「両立できる」. A small lavender calendar icon and a couple of soft checks. Calm, friendly, daily-life feeling. No big portrait.${Q}`,

  // 11) FAQ — clean chat / messaging UI, light gray + sky blue, speech bubbles, minimal
  '11_faq': `Clean minimal FAQ banner styled like a friendly MESSAGING-APP / chat UI. Light gray and white background with soft sky-blue rounded chat bubbles arranged like a conversation, a small 「Q&A」 rounded mark, lots of clean whitespace — simple and functional (NO sparkle, NO portrait, NOT flashy). Neat rounded sans typography. Title 「よくある質問」. Three short sky-blue "Q" chat bubbles, each containing exactly one of: 「未経験でも大丈夫？」「学業と両立できる？」「給与はどれくらい？」 and nothing else. Tidy, calm, UI-like. Do NOT invent any other questions or text.${Q}`,

  // 13) SHIMEKIRI — bold alert, red & black, stamp, strong contrast urgency
  '13_shimekiri': `High-impact DEADLINE alert banner. Bold red and near-black background with a diagonal warning-stripe accent and a rough red rubber-stamp circle reading 「締切間近」. Strong, condensed, heavy Japanese poster typography in white and yellow — maximum urgency and contrast (dramatic, NOT pastel or cute). Headline (stacked): 「今期枠」 then huge 「まもなく締切」 (締切 emphasized). A small hourglass and a ribbon badge 「特別先行ルート 今だけ」. Punchy, last-chance energy. No human photo.${Q}`,

  // 14) LAST — cinematic warm sunrise finale, orange/pink/purple gradient, path/door, uplifting
  '14_last': `Cinematic UPLIFTING finale banner. Warm sunrise gradient sky (golden orange → soft pink → gentle purple) with light rays, a glowing horizon and a symbolic path or open door leading toward bright light — hopeful, emotional, movie-poster feel (atmospheric, NOT a flat ad layout). A small silhouette of a young person stepping forward is welcome. Graceful modern typography, glowing white. Headline (stacked): 「あなたの"好き"を」 then 「就活の武器に」 (武器 glowing). At the bottom, a soft rounded CTA pill 「エントリー受付中」 with a small arrow. Warm, inspiring, cinematic closer.${Q}`,
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
