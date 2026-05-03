import puppeteer from 'puppeteer';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function renderHtmlToPng(htmlPath, outputPath, { width = 1080, height = 1350 } = {}) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 2 });
    const absolutePath = resolve(htmlPath);
    await page.goto(`file://${absolutePath}`, { waitUntil: 'networkidle0' });
    await page.screenshot({
      path: outputPath,
      type: 'png',
      clip: { x: 0, y: 0, width, height },
      omitBackground: false,
    });
  } finally {
    await browser.close();
  }
  return outputPath;
}
