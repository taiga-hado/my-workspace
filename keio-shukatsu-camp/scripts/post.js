import 'dotenv/config';
import { postSingleImage } from '../lib/instagram.js';
import { uploadToTempHost } from '../lib/upload.js';

const [, , imagePath, ...captionParts] = process.argv;
const caption = captionParts.join(' ');

if (!imagePath) {
  console.error('Usage: node scripts/post.js <image-path-or-url> "<caption>"');
  process.exit(1);
}

const isUrl = /^https?:\/\//.test(imagePath);
let imageUrl = imagePath;

if (!isUrl) {
  console.log(`📤 Uploading local file to temp host: ${imagePath}`);
  imageUrl = await uploadToTempHost(imagePath);
  console.log(`   → ${imageUrl}\n`);
}

console.log(`📸 Creating Instagram media container...`);
console.log(`📝 Caption: ${caption || '(empty)'}\n`);

try {
  const result = await postSingleImage({ imageUrl, caption });
  console.log('✅ Post published!');
  console.log(`   Media ID: ${result.id}`);
  console.log(`   View it on: https://www.instagram.com/keioshukatsucamp/`);
} catch (err) {
  console.error('❌ Post failed:');
  console.error(err.message);
  process.exit(1);
}
