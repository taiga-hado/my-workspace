// v2 images (feedback 2026-09-15): 3社厳選訴求・カレンダー廃止
import fs from 'node:fs/promises';
import path from 'node:path';
const API = 'https://api.openai.com/v1/images/generations';
const KEY = process.env.OPENAI_API_KEY;
const OUT = path.join(import.meta.dirname, 'images');
const Q = `\n\n— Style: premium Japanese recruitment/career-service LINE banner. Palette: deep navy (#0f2a4a), white, champagne gold accents, light grey cards. Target audience: Japanese men aged 25-34 in physically demanding or quota-driven jobs who want a weekday office job with weekends off. Typography: bold modern Gothic, high legibility. Render EVERY Japanese character perfectly correct and clean (no garbled/fake glyphs). No English paragraph text, no watermark, no logos except a small text mark 「ハックツ就職」 at top-left. Include EXACTLY the text listed and nothing else. Professional, trustworthy, masculine, not cute, no pink.`;
const JOBS = {
  '60_nagare_v2': `Square LINE banner, flat infographic, no photo. Top: small mark 「ハックツ就職」, headline navy on white 「未経験→オフィスワーク 転職の流れ」. A vertical timeline of five steps with navy circles connected by a gold line, each with a bold label and a small grey note:
1 「登録」「今日」
2 「無料相談 20分」「最短翌日・オンライン」
3 「エージェント3社を厳選紹介」「あなたの条件に強い会社だけ」
4 「求人提案・面接」「非公開求人から2〜3社」
5 「内定」「最短2週間」
Under the timeline a light-grey box with two gold checks: 「在職中のまま進められます」「会社に連絡は一切いきません」. Bottom: big rounded navy button 「まずは相談枠を確保する ▶」.${Q}`,
  '420_agents': `Square LINE banner, clean explanatory layout, no photo. Top: small mark 「ハックツ就職」, gold ribbon 「ホワイト求人に出会う近道」, headline in navy 「エージェント選びで、結果が決まる」. Middle: a two-column comparison on white. Left column (grey header 「1社だけに登録」): a single grey building icon with grey text lines 「求人が偏る」「担当者次第」「未経験可の枠が少ない」. Right column (navy header with gold text 「ハックツ経由」): three navy building icons in a row labeled 「A社」「B社」「C社」 with a gold tag 「あなた向けに3社を厳選」 and gold-check lines 「面談で条件を整理」「その条件に強い3社を紹介」「非公開求人の選択肢が3倍」. Below: a navy strip with white text 「紹介先は面談後に決めます。合わない会社は紹介しません」. Bottom: big rounded gold button with navy text 「自分に合う3社を紹介してもらう ▶」.${Q}`,
};
for (const [name, prompt] of Object.entries(JOBS)) {
  console.log('→', name);
  const res = await fetch(API, { method: 'POST', headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-image-2', prompt, size: '1024x1024', n: 1 }) });
  if (!res.ok) { console.error('FAIL', res.status, (await res.text()).slice(0, 200)); continue; }
  const d = await res.json();
  await fs.writeFile(path.join(OUT, `${name}.png`), Buffer.from(d.data[0].b64_json, 'base64'));
  console.log('  ✓', name);
}
console.log('done.');
