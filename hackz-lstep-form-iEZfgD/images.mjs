// Section 3 (精神科通院「はい」→ 退職コンシェルジュ訴求) LP images for LSTEP form iEZfgD.
// gpt-image-2, portrait 1024x1536. Usage: node images.mjs [name ...]  (no args = all)
import fs from 'node:fs/promises';
import path from 'node:path';

const API = 'https://api.openai.com/v1/images/generations';
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1); }
const OUT = path.join(import.meta.dirname, 'images');
await fs.mkdir(OUT, { recursive: true });

const Q = `\n\n— This is one panel of a vertical smartphone landing page (portrait 2:3) introducing a free consultation service about public benefits (Japanese social insurance / unemployment insurance) for people who are struggling at work because of mental health and are considering leaving their job. Audience: Japanese people in their 20s, mostly women, who feel exhausted. Tone: calm, gentle, reassuring, trustworthy — NOT flashy, NOT salesy, no money bills or coins, no exaggerated claims, no specific yen amounts, no percentages. Soft palette: warm ivory background, sage green and soft teal accents, a little warm peach. Clean modern rounded Japanese sans typography. Render every Japanese character perfectly legible and correct (NO garbled or fake glyphs). Use ONLY the Japanese text specified; do not add any other text, numbers, logos or watermarks. Generous margins so nothing is cut off at the edges.`;

const JOBS = {
  '01_fv': `Hero / first-view panel. Top: small rounded sage-green label 「退職コンシェルジュ 無料相談」. Large stacked headline in dark charcoal: 「心や体がつらくて」 / 「仕事を続けるのが」 / 「しんどいあなたへ」. Below it, a softer subheadline: 「退職後の生活を、」 / 「公的な給付金で支えられる」 / 「かもしれません」. Illustration: a gentle soft-watercolor style young Japanese woman sitting by a sunny window with a warm cup of tea, relaxed, a small plant nearby — peaceful, recovering, hopeful (not sad or dramatic). At the bottom a soft rounded white card with the text 「まずは受給できるか、無料で確認」.${Q}`,

  '02_seido': `Information panel explaining two public benefit systems. Title at top: 「使える可能性のある制度」. Two large soft rounded white cards stacked vertically, each with a simple line icon on the left:
Card 1 (sage green header band) heading 「傷病手当金」, body lines 「健康保険の制度」 / 「病気で働けない期間の生活を支える」 / 「通算で最長1年6か月」. Icon: a simple heart with a shield.
Card 2 (soft teal header band) heading 「失業手当（基本手当）」, body lines 「雇用保険の制度」 / 「条件により給付日数が手厚くなる場合も」. Icon: a simple house with a small leaf.
At the bottom, small grey note text: 「※受給の可否・金額は加入状況などにより異なります」. Clean flat infographic, lots of whitespace.${Q}`,

  '03_flow': `Panel with a checklist and a 3-step flow. Upper half title: 「こんな方はご相談ください」 followed by three rows with sage-green check marks: 「在職中から心療内科・精神科に通院している」 / 「社会保険・雇用保険に1年以上加入している」 / 「次の就職先はまだ決まっていない」.
Lower half title: 「ご相談の流れ」 with three numbered rounded steps connected by a soft dotted line: 「1 LINEでかんたん受付」 / 「2 無料面談で受給の見込みを確認」 / 「3 申請の準備をサポート」.
Bottom: a soft peach rounded banner 「ご相談は無料です」. Simple friendly line icons, calm flat infographic style.${Q}`,
};

const targets = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(JOBS);
await Promise.all(targets.map(async (name) => {
  const prompt = JOBS[name];
  if (!prompt) { console.warn(`skip unknown: ${name}`); return; }
  const res = await fetch(API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-image-2', prompt, size: '1024x1536', quality: 'high', n: 1 }),
  });
  if (!res.ok) { console.error(`FAIL ${name} ${res.status}: ${await res.text()}`); return; }
  const data = await res.json();
  await fs.writeFile(path.join(OUT, `${name}.png`), Buffer.from(data.data[0].b64_json, 'base64'));
  console.log(`✓ ${name}.png`);
}));
