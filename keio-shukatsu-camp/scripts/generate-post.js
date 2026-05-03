import 'dotenv/config';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { generateCarouselContent } from '../lib/content-generator.js';
import { buildCoverPrompt, buildSlidePrompt } from '../lib/image-prompt-builder.js';
import { generateImage } from '../lib/openai.js';
import { themes, getThemeForToday, pickRandomExample } from '../lib/themes.js';

const args = process.argv.slice(2);
const themeKey = args.find((a) => themes[a]) ?? null;
const titleIdx = args.findIndex((a) => a === '--title');
const customTitle = titleIdx === -1 ? null : args.slice(titleIdx + 1).join(' ');

const theme = themeKey ? { key: themeKey, ...themes[themeKey] } : getThemeForToday();
const exampleTitle = customTitle || pickRandomExample(theme);

// 次回予告：明日の曜日テーマからランダム
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowTheme = getThemeForToday(tomorrow);
const nextPreview = {
  date: `${tomorrow.getMonth() + 1}/${tomorrow.getDate()}(${['日', '月', '火', '水', '木', '金', '土'][tomorrow.getDay()]})`,
  title: pickRandomExample(tomorrowTheme),
};

console.log(`📚 Today's theme: ${theme.pillar} (${theme.key})`);
console.log(`📰 Title: ${exampleTitle}`);
console.log(`🔮 Next preview: ${nextPreview.date} - ${nextPreview.title}\n`);

console.log('🤖 Step 1/2: Generating content structure with GPT-4o...');
const content = await generateCarouselContent({ theme, exampleTitle, nextPreview });
console.log(`   Cover title: ${content.title}`);
console.log(`   Slides: ${content.slides.length}\n`);

const today = new Date().toISOString().slice(0, 10);
const outDir = `content/${today}-${theme.key}`;
await mkdir(outDir, { recursive: true });

await writeFile(join(outDir, 'content.json'), JSON.stringify(content, null, 2));
await writeFile(join(outDir, 'caption.txt'), content.caption);

const coverPrompt = buildCoverPrompt(content);
const slideTasks = content.slides.map((s) => ({
  id: s.id,
  prompt: buildSlidePrompt(s, content.slides.length + 1),
}));

console.log(`🎨 Step 2/2: Generating ${1 + slideTasks.length} images via gpt-image-2 (parallel)...`);

async function genAndSave({ id, prompt, filename }) {
  try {
    const buf = await generateImage({ prompt });
    const path = join(outDir, filename);
    await writeFile(path, buf);
    console.log(`   ✅ ${filename}`);
    return path;
  } catch (err) {
    console.error(`   ❌ ${filename}: ${err.message}`);
    throw err;
  }
}

const results = await Promise.allSettled([
  genAndSave({ id: 1, prompt: coverPrompt, filename: '01-cover.png' }),
  ...slideTasks.map((t) =>
    genAndSave({ id: t.id, prompt: t.prompt, filename: `${String(t.id).padStart(2, '0')}-slide.png` })
  ),
]);

const ok = results.filter((r) => r.status === 'fulfilled').length;
const total = results.length;
console.log(`\n📦 ${ok}/${total} images generated`);
console.log(`📂 Saved to: ${outDir}`);
console.log(`\n📤 Next: review images in ${outDir}/, then publish:`);
console.log(`   npm run post:carousel ${outDir}/01-cover.png ${outDir}/02-slide.png ${outDir}/03-slide.png ${outDir}/04-slide.png ${outDir}/05-slide.png ${outDir}/06-slide.png ${outDir}/07-slide.png ${outDir}/08-slide.png ${outDir}/09-slide.png ${outDir}/10-slide.png --caption-file ${outDir}/caption.txt`);
