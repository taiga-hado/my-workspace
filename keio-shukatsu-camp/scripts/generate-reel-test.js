import { makeSlideshowReel } from '../lib/ffmpeg.js';

const images = [
  '/tmp/keio_cover_v3.png',
  '/tmp/keio_slide_2.png',
  '/tmp/keio_slide_3.png',
  '/tmp/keio_slide_4.png',
  '/tmp/keio_slide_5.png',
  '/tmp/keio_slide_6.png',
  '/tmp/keio_slide_7.png',
  '/tmp/keio_slide_8.png',
  '/tmp/keio_slide_9.png',
  '/tmp/keio_slide_10.png',
];

// 各3秒 → 合計約30秒のReels
const durations = images.map(() => 3);

const outputPath = '/tmp/keio_reel_v1.mp4';
console.log(`🎬 Generating ${images.length}-image slideshow Reel (${durations.reduce((a, b) => a + b, 0)}s)...`);
await makeSlideshowReel({ images, durations, outputPath });
console.log(`✅ Generated: ${outputPath}`);
