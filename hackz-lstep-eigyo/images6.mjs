// Carousel pattern B (photo + yellow tag) — gpt-image-2. Usage: node images6.mjs [names...]
import fs from 'node:fs/promises';
import path from 'node:path';
const API = 'https://api.openai.com/v1/images/generations';
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1); }
const OUT = path.join(import.meta.dirname, 'images');
await fs.mkdir(OUT, { recursive: true });

const Q = `\n\n— CONTEXT: a LINE carousel card image about 240px wide, shown beside two sibling cards, with its own title/body/button rendered underneath by LINE. ONE clear subject, close crop from the chest up, generous empty space, strong contrast, no clutter.
— PEOPLE: Japanese, in their twenties, fresh and clean-cut (爽やか): neat hair, clear skin, light natural make-up at most, simple clean clothes, relaxed natural smile, friendly and approachable — an ordinary likeable person, not a glamorous model, not a stiff stock-photo pose.
— LOOK: realistic warm natural photography, bright daylight, airy and clean, soft shallow depth of field. Accent colours fresh green (#1f8a3f) and bright yellow (#ffd400).
— TAG: a bright yellow ribbon tag pinned in the TOP-LEFT corner of the frame, small, with its characters in bold dark green.
— STRICT: no headline, no sub-copy, no button, no logo, no invented statistics, no percentages, no English words, and no Japanese characters other than the tag text listed.`;

const S = { wide: '1536x1024' };
const JOBS = {
  'c1_kyujin': { size: S.wide, prompt: `A woman in her mid-20s in clean office-casual clothes in a bright modern office. Holding a printed job sheet and looking at the camera with a bright, easy smile. Tag text: 「非公開求人」.${Q}` },
  'c2_shindan': { size: S.wide, prompt: `A man in his mid-20s in a simple light shirt, sitting by a bright window. Looking down at a smartphone held in both hands, curious and hopeful expression, head slightly tilted, bright simple indoor background. Tag text: 「適性診断」.${Q}` },
  'c3_ca': { size: S.wide, prompt: `A woman in her late 20s in a light jacket. A friendly career advisor in a bright modern office, smiling gently at the camera, hands relaxed, notebook on the desk in the blurred foreground. Tag text: 「担当者」.${Q}` },
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
