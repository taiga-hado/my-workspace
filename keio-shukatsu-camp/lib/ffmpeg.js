import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const execFileAsync = promisify(execFile);

export async function makeSlideshowReel({
  images,
  durations,
  outputPath,
  width = 1080,
  height = 1920,
  bgColor = '#0B1B3D',
  fps = 30,
}) {
  if (images.length !== durations.length) {
    throw new Error('images and durations must have same length');
  }
  const tmpDir = await mkdtemp(join(tmpdir(), 'reel-'));
  const listPath = join(tmpDir, 'list.txt');

  const lines = [];
  for (let i = 0; i < images.length; i++) {
    lines.push(`file '${images[i]}'`);
    lines.push(`duration ${durations[i]}`);
  }
  lines.push(`file '${images[images.length - 1]}'`);
  await writeFile(listPath, lines.join('\n'));

  const args = [
    '-f', 'concat', '-safe', '0', '-i', listPath,
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
    '-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=${bgColor}`,
    '-c:v', 'libx264', '-c:a', 'aac',
    '-r', String(fps), '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-shortest',
    '-y', outputPath,
  ];
  await execFileAsync('ffmpeg', args);
  return outputPath;
}
