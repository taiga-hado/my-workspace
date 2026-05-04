// Generate realistic intern collage photos via gpt-image-2
// iPhone-snapshot style with realism suffix
// Usage: source ~/.zshrc && node hero-images.mjs
import fs from 'node:fs/promises';
import path from 'node:path';

const API = 'https://api.openai.com/v1/images/generations';
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1); }

const OUT = path.join(import.meta.dirname, 'images');
await fs.mkdir(OUT, { recursive: true });

const REALISM = `

Shot on an iPhone, casual snapshot, NOT a professional photo.
Candid unposed moment, accidental framing — subject slightly off-center, slightly tilted horizon.
Visible smartphone sensor noise and grain, mild JPEG compression artifacts.
Slight motion blur on subject from handheld shake. Imperfect focus — autofocus slightly missed.
Mixed indoor lighting (fluorescent ceiling lights + window daylight), slight color cast, uneven exposure with a few blown highlights or shadow areas.
Realistic skin texture with visible pores and subtle imperfections — NOT smooth or retouched.
Background slightly blurred but not bokeh-perfect — natural smartphone-style depth.
Natural everyday scene, looks like it was taken in 2 seconds without thinking.`;

const OFFICE = `Modern minimalist Tokyo startup office (Mercari/SmartHR/LayerX-like aesthetic): white walls, light oak wood floors and desks, large floor-to-ceiling windows with natural daylight, indoor plants (monstera, pothos), Herman Miller chairs.`;

const PEOPLE_STYLE = `Attractive young Japanese university students (ages 20-22), photogenic. Wearing casual modern Japanese student fashion: oversized shirts in cream/beige/white/light blue tones, minimal stylish accessories.`;

const JOBS = {
  'hero-real-1': {
    size: '1536x1024',
    prompt: `Group of 5 ${PEOPLE_STYLE.toLowerCase()} (3 girls and 2 guys) gathered around a MacBook laptop on a wooden desk, all laughing genuinely at something funny on the screen — one girl in the center is pointing and laughing hard, the others are leaning in. Genuine joy, real teamwork moment. ${OFFICE}${REALISM}`,
  },
  'hero-real-2': {
    size: '1024x1536',
    prompt: `Close-up of two ${PEOPLE_STYLE.toLowerCase()} (one guy and one girl) leaning in close together looking at a smartphone screen, both grinning and pointing at the screen, excited about something they discovered on Instagram or TikTok. Phone screen is the main focus point. ${OFFICE}${REALISM}`,
  },
  'hero-real-3': {
    size: '1536x1024',
    prompt: `Three ${PEOPLE_STYLE.toLowerCase()} (2 girls 1 guy) standing in front of a large whiteboard covered in colorful sticky notes and marker writing, one girl in the middle is drawing arrows on the whiteboard while explaining, the others are nodding and smiling, listening engaged. Energetic brainstorm session. ${OFFICE}${REALISM}`,
  },
  'hero-real-4': {
    size: '1024x1536',
    prompt: `Single attractive Japanese female university student intern (age 21, photogenic) sitting at a desk, filming a short video on her smartphone with a ring light, looking into the camera lens with a bright happy smile while gesturing with her hands. Ring light visible in the foreground. ${OFFICE}${REALISM}`,
  },
  'hero-real-5': {
    size: '1536x1024',
    prompt: `Group of 4 ${PEOPLE_STYLE.toLowerCase()} (2 girls 2 guys) celebrating with high-fives in the office, mid-action shot of two of them slapping hands above the desk, the other two cheering and laughing. They just hit a goal — a viral post or KPI achievement. Laptops visible on desks. ${OFFICE}${REALISM}`,
  },
  'hero-real-6': {
    size: '1024x1536',
    prompt: `Two ${PEOPLE_STYLE.toLowerCase()} (one guy one girl) standing in a modern bright office, holding takeaway coffee cups, laughing together while having a casual chat. Body language relaxed, friendly. Window light from the side. ${OFFICE}${REALISM}`,
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
    console.error('error:', await res.text());
    continue;
  }
  const data = await res.json();
  const b64 = data.data[0].b64_json;
  const buf = Buffer.from(b64, 'base64');
  const outPath = path.join(OUT, `${name}.png`);
  await fs.writeFile(outPath, buf);
  console.log(`  ✓ ${outPath}`);
}
