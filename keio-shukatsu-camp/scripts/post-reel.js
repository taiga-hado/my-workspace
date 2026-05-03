import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { getMe, publishMediaContainer } from '../lib/instagram.js';
import { uploadToTempHost } from '../lib/upload.js';

const BASE = 'https://graph.instagram.com/v22.0';
const token = process.env.INSTAGRAM_ACCESS_TOKEN;

const args = process.argv.slice(2);
const captionIdx = args.findIndex((a) => a === '--caption' || a === '--caption-file');
const videoPath = captionIdx === -1 ? args[0] : args[0];
let caption = '';
if (captionIdx !== -1) {
  const flag = args[captionIdx];
  const value = args.slice(captionIdx + 1).join(' ');
  caption = flag === '--caption-file' ? await readFile(value, 'utf-8') : value;
}

if (!videoPath) {
  console.error('Usage: node scripts/post-reel.js <video-path> [--caption "<text>" | --caption-file <path>]');
  process.exit(1);
}

console.log(`📤 Uploading video: ${videoPath}`);
const videoUrl = /^https?:\/\//.test(videoPath)
  ? videoPath
  : await uploadToTempHost(videoPath);
console.log(`   → ${videoUrl}\n`);

const me = await getMe();

console.log('📸 Creating Reels container...');
const params = new URLSearchParams({
  media_type: 'REELS',
  video_url: videoUrl,
  caption,
  access_token: token,
});
const containerRes = await fetch(`${BASE}/${me.id}/media?${params}`, { method: 'POST' });
const container = await containerRes.json();
if (!container.id) {
  console.error('❌ Container creation failed:', container);
  process.exit(1);
}
console.log(`   Container ID: ${container.id}\n`);

console.log('⏳ Waiting for video processing...');
let finished = false;
for (let i = 0; i < 30; i++) {
  await new Promise((r) => setTimeout(r, 5000));
  const statusRes = await fetch(`${BASE}/${container.id}?fields=status_code,status&access_token=${token}`);
  const status = await statusRes.json();
  console.log(`   [${i + 1}/30] status_code=${status.status_code} status=${status.status || ''}`);
  if (status.status_code === 'FINISHED') {
    finished = true;
    break;
  }
  if (status.status_code === 'ERROR') {
    console.error('❌ Processing error:', status);
    process.exit(1);
  }
}
if (!finished) {
  console.error('❌ Timeout: video did not finish processing within 150s');
  process.exit(1);
}

console.log('\n📸 Publishing Reels...');
try {
  const result = await publishMediaContainer({ creationId: container.id, igUserId: me.id });
  console.log('✅ Reels published!');
  console.log(`   Media ID: ${result.id}`);
  console.log(`   View: https://www.instagram.com/keioshukatsucamp/`);
} catch (err) {
  console.error('❌ Publish failed:');
  console.error(err.message);
  process.exit(1);
}
