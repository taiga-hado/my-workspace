// Carousel A/B/C/D exploration — gpt-image-2. Usage: node images5.mjs [names...]
import fs from 'node:fs/promises';
import path from 'node:path';
const API = 'https://api.openai.com/v1/images/generations';
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1); }
const OUT = path.join(import.meta.dirname, 'images/patterns');
await fs.mkdir(OUT, { recursive: true });

const BASE = `\n\n— CONTEXT: a LINE carousel card image, about 240px wide, shown beside two sibling cards, with its own title/body/button rendered underneath by LINE. So: ONE clear subject, close crop, generous empty space, strong contrast, no clutter. STRICT: no headline, no sub-copy, no button, no logo, no invented statistics, no percentages, no English words, and no Japanese characters other than those explicitly listed. Accent colours: fresh green (#1f8a3f) and bright yellow (#ffd400).`;
const PHOTO = `${BASE} Realistic, warm, natural photography (not illustration, not 3D render).`;
const FLAT = `${BASE} Clean flat vector illustration, rounded friendly shapes, thick consistent line weight, white background, no photographic texture.`;
const SOLID = `${BASE} Perfectly flat design: a solid fresh-green background filling the whole frame, one bold white line icon centred, simple and geometric.`;

const S = { wide: '1536x1024' };
const JOBS = {
  // A: 実写・人物・文字ゼロ
  'a1': { size: S.wide, prompt: `A Japanese man in his mid-20s in a yellow hard hat and work vest, standing on a sunny construction site holding a tablet, looking ahead with a calm confident smile, chest-up, shallow depth of field. No text anywhere in the image.${PHOTO}` },
  'a2': { size: S.wide, prompt: `A Japanese man in his mid-20s in casual clothes sitting by a window, looking down at his smartphone with a thoughtful, slightly hopeful expression, one hand on his chin, soft daylight. No text anywhere in the image.${PHOTO}` },
  'a3': { size: S.wide, prompt: `Over-the-shoulder view of a friendly Japanese career advisor in her late 20s talking with a young man across a small table in a bright office, both leaning in, warm and relaxed. No text anywhere in the image.${PHOTO}` },
  // B: 実写＋黄色タグ1語
  'b1': { size: S.wide, prompt: `A Japanese man in his mid-20s in a yellow hard hat on a sunny construction site holding a printed job sheet, seen from the chest up. A bright yellow ribbon tag sits in the top-left corner of the frame with the characters 「非公開求人」 in bold dark green. The only text anywhere in the image is 「非公開求人」.${PHOTO}` },
  'b2': { size: S.wide, prompt: `A Japanese man in his mid-20s looking at his smartphone with a thoughtful expression, bright simple background. A bright yellow ribbon tag sits in the top-left corner of the frame with the characters 「適性診断」 in bold dark green. The only text anywhere in the image is 「適性診断」.${PHOTO}` },
  'b3': { size: S.wide, prompt: `A friendly Japanese career advisor in her late 20s in a bright office, smiling gently at the camera, chest-up. A bright yellow ribbon tag sits in the top-left corner of the frame with the characters 「担当者」 in bold dark green. The only text anywhere in the image is 「担当者」.${PHOTO}` },
  // C: 緑ベタ＋白アイコン＋白1語
  'c1': { size: S.wide, prompt: `One bold white line icon centred: a document sheet with a keyhole in the middle, a small padlock at its corner. Under the icon, the characters 「非公開求人」 in bold white. The only text anywhere in the image is 「非公開求人」.${SOLID}` },
  'c2': { size: S.wide, prompt: `One bold white line icon centred: a clipboard with three check marks and a magnifying glass over it. Under the icon, the characters 「適性診断」 in bold white. The only text anywhere in the image is 「適性診断」.${SOLID}` },
  'c3': { size: S.wide, prompt: `One bold white line icon centred: a simple person bust inside a circle with a check badge at its lower right. Under the icon, the characters 「担当者」 in bold white. The only text anywhere in the image is 「担当者」.${SOLID}` },
  // D: フラットイラスト・文字ゼロ
  'd1': { size: S.wide, prompt: `A young worker in a yellow hard hat receiving a job sheet handed over by an advisor, both drawn waist-up, warm and friendly, green and yellow accents on white. No text anywhere in the image.${FLAT}` },
  'd2': { size: S.wide, prompt: `A young person standing beside an oversized smartphone that shows a simple checklist and a rising bar chart, a magnifying glass floating over the screen, green and yellow accents on white. No text anywhere in the image.${FLAT}` },
  'd3': { size: S.wide, prompt: `Two people sitting across a small desk in a friendly one-to-one meeting, one wearing a yellow hard hat, the other an advisor with a notepad, green and yellow accents on white. No text anywhere in the image.${FLAT}` },
};

const targets = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(JOBS);
for (const name of targets) {
  const job = JOBS[name]; if (!job) { console.warn('skip', name); continue; }
  console.log('→', name);
  for (let attempt = 1; attempt <= 2; attempt++) {
    const res = await fetch(API, { method: 'POST', headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-image-2', prompt: job.prompt, size: job.size, n: 1 }) });
    if (!res.ok) { console.error('  FAIL', res.status, (await res.text()).slice(0, 200)); continue; }
    const d = await res.json();
    await fs.writeFile(path.join(OUT, `${name}.png`), Buffer.from(d.data[0].b64_json, 'base64'));
    console.log('  ✓', name); break;
  }
}
console.log('done.');
