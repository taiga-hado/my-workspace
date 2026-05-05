import 'dotenv/config';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { generateCarouselContent } from '../lib/content-generator.js';
import { buildCoverPrompt, buildSlidePrompt } from '../lib/image-prompt-builder.js';
import { generateImage } from '../lib/openai.js';
import { getThemeForToday, pickRandomExample } from '../lib/themes.js';
import { postCarousel, postReel, postStory } from '../lib/instagram.js';
import { uploadToTempHost } from '../lib/upload.js';
import { makeSlideshowReel } from '../lib/ffmpeg.js';

const startTime = Date.now();
const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);
const days = ['日', '月', '火', '水', '木', '金', '土'];

try {
  log('===== Daily auto-post started =====');

  const theme = getThemeForToday();
  const exampleTitle = pickRandomExample(theme);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowTheme = getThemeForToday(tomorrow);
  const nextPreview = {
    date: `${tomorrow.getMonth() + 1}/${tomorrow.getDate()}(${days[tomorrow.getDay()]})`,
    title: pickRandomExample(tomorrowTheme),
  };
  log(`Theme: ${theme.pillar} (${theme.key}) | Title: ${exampleTitle}`);

  log('Step 1/4: Generating content with GPT-4o...');
  const content = await generateCarouselContent({ theme, exampleTitle, nextPreview });
  log(`Cover: "${content.title}" | Slides: ${content.slides.length}`);

  const today = new Date().toISOString().slice(0, 10);
  const outDir = `content/${today}-${theme.key}`;
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, 'content.json'), JSON.stringify(content, null, 2));
  await writeFile(join(outDir, 'caption.txt'), content.caption);

  log('Step 2/4: Generating 10 images via gpt-image-2 (parallel)...');
  const coverPrompt = buildCoverPrompt(content);
  const slidePrompts = content.slides.map((s) => ({
    id: s.id,
    prompt: buildSlidePrompt(s, content.slides.length + 1),
  }));
  const tasks = [
    { filename: '01-cover.png', prompt: coverPrompt },
    ...slidePrompts.map((p) => ({
      filename: `${String(p.id).padStart(2, '0')}-slide.png`,
      prompt: p.prompt,
    })),
  ];
  const paths = await Promise.all(
    tasks.map(async (t) => {
      const buf = await generateImage({ prompt: t.prompt });
      const path = join(outDir, t.filename);
      await writeFile(path, buf);
      log(`  ✅ ${t.filename}`);
      return path;
    })
  );

  log('Step 3/4: Uploading images to temp host...');
  const imageUrls = await Promise.all(paths.map((p) => uploadToTempHost(p)));

  log('Step 4/6: Publishing carousel to Instagram...');
  const carouselResult = await postCarousel({ imageUrls, caption: content.caption });
  log(`✅ Carousel published! Media ID: ${carouselResult.id}`);

  log('Step 5/6: Generating and publishing Reel from same images...');
  try {
    const reelPath = join(outDir, 'reel.mp4');
    await makeSlideshowReel({
      images: paths,
      durations: paths.map(() => 3),
      outputPath: reelPath,
    });
    const reelUrl = await uploadToTempHost(reelPath);
    const reelResult = await postReel({ videoUrl: reelUrl, caption: content.caption });
    log(`✅ Reel published! Media ID: ${reelResult.id}`);
  } catch (err) {
    log(`⚠️  Reel skipped: ${err.message}`);
  }

  log('Step 6/6: Publishing Story (cover image)...');
  try {
    const storyResult = await postStory({ imageUrl: imageUrls[0] });
    log(`✅ Story published! Media ID: ${storyResult.id}`);
  } catch (err) {
    log(`⚠️  Story skipped: ${err.message}`);
  }

  log(`URL: https://www.instagram.com/keioshukatsucamp/`);
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  log(`===== Done in ${elapsed}s =====`);
} catch (err) {
  log(`❌ Failed: ${err.message}`);
  console.error(err);
  process.exit(1);
}
