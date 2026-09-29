// Carousel images (minimal, one subject each) — gpt-image-2. Usage: node images3.mjs [names...]
import fs from 'node:fs/promises';
import path from 'node:path';
const API = 'https://api.openai.com/v1/images/generations';
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1); }
const OUT = path.join(import.meta.dirname, 'images');
await fs.mkdir(OUT, { recursive: true });

const Q = `\n\n— HARD RULES: this is a SMALL card shown next to two other cards, so it must read instantly. ONE single focal subject, generous empty space, strong contrast. NO headline, NO caption, NO sub-text, NO button, NO logo, NO statistics, NO percentages, NO numbers other than any explicitly listed below. Do NOT add any Japanese or English sentence that is not listed below. Palette: fresh green (#1f8a3f), bright yellow (#ffd400) and white, light clean background. Modern, friendly, trustworthy. Any listed Japanese characters must be rendered perfectly and large.`;

const S = { wide: '1536x1024' };
const JOBS = {
  'c1_kyujin': { size: S.wide, prompt: `A stack of face-down job-listing cards on a clean light surface, with ONE card lifted and glowing, closed with a red wax seal; a small gold padlock leaning on the stack; soft spotlight on the lifted card, subtle dark vignette at the edges to make it pop. The only text anywhere in the image is the three characters 「非公開」 embossed on the red wax seal.${Q}` },
  'c2_shindan': { size: S.wide, prompt: `A large semicircular gauge meter, its needle swinging from a grey zone into a bright green zone, floating above a simple smartphone outline on a clean light background; three small green check marks beside it. The only text anywhere in the image is the two characters 「診断」 placed in bold inside the gauge.${Q}` },
  'c3_ca': { size: S.wide, prompt: `A neat grid of many small grey silhouette portrait icons; exactly ONE of them is replaced by a full-colour round photo of a friendly Japanese career advisor in her late 20s wearing a yellow hard hat, noticeably larger, lit by a soft spotlight, with a green circular check badge on its corner. Clean light background. No text anywhere in the image at all.${Q}` },
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
