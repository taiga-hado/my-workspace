// Day-0 scenario images for ミドル男性ver — gpt-image-2. Usage: node images.mjs [names...]
import fs from 'node:fs/promises';
import path from 'node:path';
const API = 'https://api.openai.com/v1/images/generations';
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1); }
const OUT = path.join(import.meta.dirname, 'images');
await fs.mkdir(OUT, { recursive: true });

const Q = `\n\n— Style: premium Japanese recruitment/career-service LINE banner. Palette: deep navy (#0f2a4a), white, champagne gold accents, light grey cards. Same world as a high-end job listing card. Target audience: Japanese men in their early 30s who work physically demanding or quota-driven jobs and want a weekday office job with weekends off. Photos (if any): realistic, natural-looking Japanese man around 30-34, short black hair, clean office/casual-business look, calm confident expression, NOT a model-like smile. Typography: bold modern Gothic, high legibility. Render EVERY Japanese character perfectly correct and clean (no garbled/fake glyphs). No English paragraph text, no watermark, no logos except a small text mark 「ハックツ就職」 at top-left. Include EXACTLY the text listed and nothing else. Professional, trustworthy, masculine, not cute, no pink.`;

const S = { sq: '1024x1024', wide: '1536x1024' };
const JOBS = {
  // carousel (wide 3:2)
  'c1_kyujin': { size: S.wide, prompt: `Carousel card image, no text at all except a small tag 「非公開求人」 on a gold ribbon. Visual: a stack of premium job-listing cards on a navy desk, one card lifted showing a blurred layout with a gold 「年収600万〜」 chip, soft spotlight, shallow depth of field. Clean, uncluttered.${Q}` },
  'c2_shindan': { size: S.wide, prompt: `Carousel card image, no text except a small label 「転職可能性診断」. Visual: a smartphone on a navy desk showing a simple result screen with a rising bar chart from grey to gold and a gold check mark, next to a coffee cup. Clean, minimal.${Q}` },
  'c3_soudan': { size: S.wide, prompt: `Carousel card image, no text except a small label 「無料相談 20分」. Visual: an online video-call on a laptop screen: a Japanese male career advisor in his 30s in a navy jacket listening attentively, warm office lighting, laptop on a wooden desk. Calm and trustworthy.${Q}` },

  // 5min: 内定事例
  '05_jirei': { size: S.sq, prompt: `Square LINE banner. Top: small mark 「ハックツ就職」, then a navy header band with white text 「直近の内定事例」 and a gold sub-tag 「30代・未経験からの転職」. Body: three horizontal white cards on light grey, each with a small round photo of a different Japanese man (32 / 34 / 29 years old look) and text:
Card1: 「32歳 男性」「施工管理 → SaaS法人営業」「年収420万 → 600万」「土日祝休み」
Card2: 「34歳 男性」「飲食店長 → 人事・採用担当」「年収380万 → 520万」「定時退社」
Card3: 「29歳 男性」「配送ドライバー → ITインフラエンジニア」「年収360万 → 480万」「リモート可」
The after-salary numbers in gold. Bottom: a slim progress bar labeled 「無料相談枠 残り7/50」 mostly filled in gold, then a big rounded navy button with white text 「自分の場合を診断する ▶」. Tiny footnote 「※実績・条件は一例です」.${Q}` },

  // 30min: 非公開求人ピックアップ
  '30_kyujin': { size: S.sq, prompt: `Square LINE banner, information-dense but tidy. Top: small mark 「ハックツ就職」, gold ribbon 「非公開求人ピックアップ」, headline in white on navy 「未経験から年収600万へ」. Body: five slim white rows on light grey, each with a line icon, job name in navy bold and figures in gold:
「人事・採用担当」「月収42万〜 / 年収600万〜 / 年休130日以上」
「SaaS法人営業」「月収45万〜 / 年収600万〜 / 土日祝休み」
「ITインフラエンジニア」「月収42万〜 / 年収560万〜 / 土日祝休み」
「事業企画・営業企画」「月収46万〜 / 年収620万〜 / 土日祝休み」
「SNSマーケティング職」「月収45万〜 / 年収580万〜 / 年休130日」
Below: a navy strip with three gold-check pills 「未経験スタート9割」「リモート可・フルフレックス」「ボーナス年3回」. Bottom: big rounded gold button with navy text 「条件に合う求人を紹介してもらう ▶」.${Q}` },

  // 45min: 実績
  '45_jisseki': { size: S.sq, prompt: `Square LINE banner with a large realistic photo background: a Japanese man in his early 30s in a navy jacket standing in a bright modern office, looking calmly at the camera, navy gradient overlay on the left/bottom. Top-left small mark 「ハックツ就職」. Three large white-and-gold stat blocks stacked on the left: 「転職満足度」 「99.3%」 / 「非公開求人」 「3,000件以上」 / 「平均年収」 「+91.3万円」 (numbers huge, in gold). Bottom: big rounded white button with navy text 「20分の無料相談を予約する ▶」.${Q}` },

  // 1h: 転職の流れ
  '60_nagare': { size: S.sq, prompt: `Square LINE banner, flat infographic, no photo. Top: small mark 「ハックツ就職」, headline navy on white 「未経験→オフィスワーク 転職の流れ」. A vertical timeline of five steps with navy circles connected by a gold line, each with a bold label and a small grey note:
1 「登録」「今日」
2 「無料相談 20分」「最短翌日・オンライン」
3 「求人提案・書類作成」「約1週間」
4 「面接」「2〜3社」
5 「内定」「最短2週間」
Under the timeline a light-grey box with two gold checks: 「在職中のまま進められます」「会社に連絡は一切いきません」. Bottom: big rounded navy button 「まずは相談枠を確保する ▶」.${Q}` },

  // 2h: 比較表
  '120_hikaku': { size: S.sq, prompt: `Square LINE banner, clean comparison table, no photo. Top: small mark 「ハックツ就職」, headline 「今の働き方 vs 転職後」 in navy, thin gold underline. A two-column table on white: left column header grey 「今のまま」, right column header navy with gold text 「転職後」. Four rows with row labels in navy on the far left:
「休日」: 「シフト・土日出勤」 | 「土日祝休み・年休130日」
「勤務」: 「現場・立ち仕事・残業」 | 「内勤・定時退社・リモート可」
「年収」: 「350〜450万」 | 「560〜620万〜」
「10年後」: 「体力頼み」 | 「スキルで年収が積み上がる」
Right column cells have a subtle gold left border and gold check marks. Bottom: big rounded navy button 「転職後の年収を診断する ▶」.${Q}` },

  // 3h: FAQ
  '180_faq': { size: S.sq, prompt: `Square LINE banner, FAQ layout like a tidy chat/Q&A list, no photo. Top: small mark 「ハックツ就職」, headline navy 「30代・未経験の方からよくある質問」. Four white cards on light grey, each with a gold circle 「Q」 and a navy circle 「A」:
Q「30代未経験でも採用される？」 A「未経験スタート9割。ただし年齢で枠が減るため早いほど有利」
Q「学歴や資格は必要？」 A「5職種とも不問の求人あり。入社後の資格取得支援も」
Q「年収は下がらない？」 A「現年収と比較して提案。下がる求人は最初から出しません」
Q「今の会社にバレない？」 A「在職中のまま、連絡はLINEのみ」
Bottom: big rounded navy button 「他の疑問も相談する ▶」.${Q}` },

  // 5h: 暮らしの変化
  '300_kurashi': { size: S.sq, prompt: `Square LINE banner with a warm realistic lifestyle photo background: a Japanese man in his early 30s relaxing on a weekend in a bright, spacious apartment living room with large windows, casual clothes, coffee, calm; navy gradient overlay at the bottom half. Top-left small mark 「ハックツ就職」. Headline in white with gold accent 「年収600万・土日祝休みで変わる暮らし」. Five white pill tags with gold check icons arranged in two rows: 「広い部屋へ引っ越す（家賃補助あり）」「平日夜にジム」「明日を気にせず飲む」「年2回の旅行」「毎月5万の貯金」. A single white line: 「未経験から移った30代の、平均的な変化です」. Bottom: big rounded gold button with navy text 「自分の場合を診断する ▶」.${Q}` },

  // 7h: カレンダー
  '420_calendar': { size: S.sq, prompt: `Square LINE banner, urgency but premium, no photo. Top: small mark 「ハックツ就職」, a gold ribbon 「今月の無料相談枠」, headline white on navy 「空き状況」. Body: a clean monthly calendar grid on white (Mon–Sun headers 「月火水木金土日」, 21 day cells numbered 1–21). Most cells have a grey 「×」; exactly two cells (12 and 13) are highlighted with a gold circle and a small gold label 「残り1枠」. Below the calendar a navy strip with white text 「未経験枠は年齢で締まります。今月中の相談をおすすめします」. Bottom: big rounded gold button with navy text 「今すぐ空き枠を押さえる ▶」.${Q}` },
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
