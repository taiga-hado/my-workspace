// Carousel images v3 — photo-led, one hook each. Usage: node images4.mjs [names...]
import fs from 'node:fs/promises';
import path from 'node:path';
const API = 'https://api.openai.com/v1/images/generations';
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1); }
const OUT = path.join(import.meta.dirname, 'images');
await fs.mkdir(OUT, { recursive: true });

const Q = `\n\n— CONTEXT: a LINE carousel card image, shown about 240px wide beside two other cards, with a separate title/body/button underneath. So: ONE clear subject filling the frame, shot close, generous empty space, strong contrast, no clutter. Realistic photography look (not flat vector, not 3D render). Warm, friendly Japanese recruitment-service look, same world as a green-and-yellow job-hunting article. Accent colours: fresh green (#1f8a3f) and bright yellow (#ffd400). STRICT: the image must contain ONLY the Japanese characters explicitly listed below — no headline, no sub-copy, no button, no logo, no invented statistics or percentages, no English words.`;

const S = { wide: '1536x1024' };
const JOBS = {
  'c1_kyujin': { size: S.wide, prompt: `A Japanese woman in her mid-20s in office-casual clothes holds a smartphone toward the camera, filling the right half of the frame; the phone screen shows a vertical list of job cards whose salary figures are all heavily pixelated and blurred out, except the top card which is sharp and glowing and reads 「年収500万円〜」. A small yellow ribbon tag sits on the top-left corner of the phone screen with the characters 「非公開」. Behind her a bright modern office, softly blurred. The only text anywhere in the image is 「非公開」 and 「年収500万円〜」.${Q}` },
  'c2_shindan': { size: S.wide, prompt: `A smartphone standing upright and filling most of the frame, screen facing the camera, showing a simple personal result screen: a small round portrait photo of a Japanese woman in her mid-20s in office-casual clothes at the top, and under it two bars — a short grey bar and a tall green bar with an upward arrow — plus a big yellow circular badge with a single question mark. A hand is just about to tap the screen. Behind her a bright modern office, softly blurred. The only text anywhere in the image is the two characters 「診断」, printed small at the top of the phone screen.${Q}` },
  'c3_ca': { size: S.wide, prompt: `A clean WHITE background, airy and bright. Scattered across it, many small round portrait photos of different Japanese people in business attire, printed very light and faded (low-contrast pale grey, like a soft watermark). Exactly ONE portrait, positioned centre, is much larger and in full warm colour: a friendly smiling Japanese career advisor in his late 20s, with a thin green ring around it and a green circular check badge on its lower-right corner. Bright, light, lots of white space — NOT dark, NOT a dense dark crowd. The only text anywhere in the image is 「1名を厳選」 in small bold characters directly under the colour portrait.${Q}` },
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
