import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { postCarousel } from '../lib/instagram.js';
import { uploadToTempHost } from '../lib/upload.js';

const args = process.argv.slice(2);
const captionIdx = args.findIndex((a) => a === '--caption' || a === '--caption-file');
const imagePaths = captionIdx === -1 ? args : args.slice(0, captionIdx);
let caption = '';

if (captionIdx !== -1) {
  const flag = args[captionIdx];
  const value = args.slice(captionIdx + 1).join(' ');
  caption = flag === '--caption-file' ? await readFile(value, 'utf-8') : value;
}

if (imagePaths.length < 2 || imagePaths.length > 10) {
  console.error('Usage: node scripts/post-carousel.js <img1> <img2> ... [--caption "<text>" | --caption-file <path>]');
  console.error('       (between 2 and 10 images)');
  process.exit(1);
}

console.log(`📤 Uploading ${imagePaths.length} images to temp host...`);
const imageUrls = [];
for (const p of imagePaths) {
  if (/^https?:\/\//.test(p)) {
    imageUrls.push(p);
    continue;
  }
  const url = await uploadToTempHost(p);
  console.log(`   ${p} → ${url}`);
  imageUrls.push(url);
}

console.log('\n📸 Creating carousel and publishing...');
console.log(`📝 Caption (preview): ${caption.slice(0, 80)}...\n`);

try {
  const result = await postCarousel({ imageUrls, caption });
  console.log('✅ Carousel published!');
  console.log(`   Media ID: ${result.id}`);
  console.log(`   View: https://www.instagram.com/keioshukatsucamp/`);
} catch (err) {
  console.error('❌ Failed:');
  console.error(err.message);
  process.exit(1);
}
