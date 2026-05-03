import { renderHtmlToPng } from '../lib/render.js';

const out = await renderHtmlToPng(
  'templates/cover-test.html',
  'content/cover-test.png',
  { width: 1080, height: 1350 }
);
console.log(`✅ Cover generated: ${out}`);
