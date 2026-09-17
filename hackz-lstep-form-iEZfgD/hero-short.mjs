// Re-layout the hackz form hero into a shorter version (same content, no arrows). gpt-image-2 edits.
import fs from 'node:fs/promises';
import path from 'node:path';
const KEY = process.env.OPENAI_API_KEY;
const dir = import.meta.dirname;
const size = process.argv[2] || '1024x1152';
const tag = process.argv[3] || 'a';
const prompt = `Re-layout this exact Japanese job-agency hero banner into a SHORTER, wider composition (${size}). Keep the same design language, colors (white background, green, black, yellow highlight, gold No.1 badge), same smiling Japanese woman in a beige blazer (keep her face and look identical), and reproduce ALL of these texts EXACTLY with no changes:
- Logo 「ハックツ就職」 (green italic logo with small shovel icon) at top-left
- Small line 「無料カウンセリングフォーム」
- Gold laurel badge 「エージェント紹介サービス」「No.1」 at top-right
- Big headline 「平均年収」 / 「91.3」 / 「万円UP」 (91.3 huge with yellow underline highlight)
- Two stat rows with green round icons: 「ホワイト求人数 4万件以上」 and 「提携エージェント数 100社以上」
- Three white rounded cards with green outline icons in ONE row: 「カウンセラーは人事経験者」「最短7日で内定獲得」「カメラOFFで相談OK」
- Red bold band text at the bottom 「入社完了まで完全無料」 with small gold sparkles
Layout: headline and stat rows on the left, woman on the right (cropped at waist), then the three cards row, then the red 「入社完了まで完全無料」 line at the very bottom with little margin. Remove the three red down-arrows. Keep everything tight with minimal empty space, nothing cut off at edges. Every Japanese character and number must be perfectly legible and identical to the original. No extra text.`;
const form = new FormData();
form.append('model', 'gpt-image-2');
form.append('prompt', prompt);
form.append('size', size);
form.append('quality', 'high');
form.append('image[]', new Blob([await fs.readFile(path.join(dir, 'images/hero-original.png'))], { type: 'image/png' }), 'hero.png');
const res = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: { Authorization: `Bearer ${KEY}` }, body: form });
if (!res.ok) { console.error('FAIL', res.status, await res.text()); process.exit(1); }
const data = await res.json();
await fs.writeFile(path.join(dir, `images/hero-short-${tag}.png`), Buffer.from(data.data[0].b64_json, 'base64'));
console.log('✓', tag, size);
