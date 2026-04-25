// Generate LP images via OpenAI gpt-image-1
// Usage: OPENAI_API_KEY=... node generate-images.mjs [name1 name2 ...]
import fs from 'node:fs/promises';
import path from 'node:path';

const API = 'https://api.openai.com/v1/images/generations';
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1); }

const OUT = path.join(import.meta.dirname, 'images', 'gen');
await fs.mkdir(OUT, { recursive: true });

const JOBS = {
  hero_bg: {
    size: '1536x1024',
    prompt: `Abstract futuristic visualization of "AI x Marketing solving social issues". Dark navy/black background with vibrant glowing nodes connected by thin neon-blue and purple light lines, like a neural network. Floating geometric shapes, soft bokeh of cyan and violet light, subtle grid pattern. Cinematic, hi-tech, ultra modern, premium tech-startup aesthetic. No text, no characters, no logos.`,
  },
  social_issues: {
    size: '1536x1024',
    prompt: `Abstract conceptual illustration: a glowing central AI core (gradient blue to purple to cyan sphere) radiating light beams to 6 surrounding floating spheres labeled by icons representing job-hunting, education, career change, entrepreneurship, small business, and regional disparity. Dark cosmic background with subtle grid, particle dust, soft bokeh. Premium minimal tech infographic style, neon glow, holographic feel. No text, no logos.`,
  },
  business_career: {
    size: '1024x1024',
    prompt: `Modern minimalist illustration of a digital recruitment / job-matching platform. Floating UI cards showing chat bubbles, profile silhouettes connected by glowing lines, gradient blue background, soft holographic glow, premium SaaS startup aesthetic. Clean, abstract, 3D-render look. No text, no logos.`,
  },
  business_education: {
    size: '1024x1024',
    prompt: `Modern minimalist illustration of AI-powered education / online learning. Floating book and graduation cap icons, glowing knowledge graph, particles forming a brain network, gradient purple to blue background, soft neon highlights. Premium edtech aesthetic, clean, abstract, 3D-render look. No text, no logos.`,
  },
  business_newbiz: {
    size: '1024x1024',
    prompt: `Modern minimalist illustration of a startup / new business launching: a glowing rocket made of light particles ascending from a circuit-board base, gradient cyan to purple background, soft bokeh, dynamic motion lines, premium tech-startup aesthetic. Clean, abstract, 3D-render look. No text, no logos.`,
  },
  tools_bg: {
    size: '1536x1024',
    prompt: `Wide abstract background: glowing AI neural-network mesh made of thin cyan/blue/violet lines and small bright nodes, deep dark navy background, soft radial glow in the center, subtle digital noise, premium futuristic tech aesthetic. No text, no logos, no characters.`,
  },
  training_hero: {
    size: '1536x1024',
    prompt: `Wide hero illustration: an abstract growth journey from beginner to expert. Left side shows soft glowing question marks and small floating particles, transitioning rightward into an ascending arrow made of light, with floating geometric icons of laptops, AI brain symbols, charts, and graduation caps along the path. Soft white background with subtle blue, purple, and cyan gradient blobs and a delicate dot grid. Premium minimal modern flat-illustration aesthetic, hopeful and inspiring. No text, no logos, no human faces.`,
  },
  training_ai: {
    size: '1024x1024',
    prompt: `Square illustration: a glowing holographic interface representing AI learning. A central translucent screen displays abstract chat bubbles and prompt cards, surrounded by floating icons (lightbulb, robot head, neural network sphere). Soft blue and cyan gradient on white background, subtle particles and grid pattern, premium modern flat-illustration aesthetic. Clean, friendly, educational feel. No text, no logos, no human faces.`,
  },
  training_marketing: {
    size: '1024x1024',
    prompt: `Square illustration: a stylized marketing analytics dashboard. Floating cards showing bar charts, line graphs, social media engagement bubbles, and a target/funnel icon. Soft purple and pink gradient on white background, subtle particles and grid pattern, premium modern flat-illustration aesthetic. Clean, friendly, educational feel. No text, no logos, no human faces.`,
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
    console.error(`  FAIL ${res.status}: ${await res.text()}`);
    continue;
  }
  const data = await res.json();
  const b64 = data.data[0].b64_json;
  const file = path.join(OUT, `${name}.png`);
  await fs.writeFile(file, Buffer.from(b64, 'base64'));
  console.log(`  ✓ ${file}`);
}
console.log('done.');
