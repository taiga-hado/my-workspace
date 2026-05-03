import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

async function uploadUguu(localPath) {
  const buffer = await readFile(localPath);
  const blob = new Blob([buffer]);
  const form = new FormData();
  form.append('files[]', blob, basename(localPath));
  const res = await fetch('https://uguu.se/upload.php', {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`uguu.se upload failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  if (!data.success || !data.files?.[0]?.url) throw new Error(`uguu.se upload failed: ${JSON.stringify(data)}`);
  return data.files[0].url;
}

async function uploadFileIO(localPath) {
  const buffer = await readFile(localPath);
  const blob = new Blob([buffer]);
  const form = new FormData();
  form.append('file', blob, basename(localPath));
  const res = await fetch('https://file.io/?expires=1d', {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`file.io upload failed: ${res.status}`);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error(`file.io returned non-JSON (${text.slice(0, 80)})`); }
  if (!data.success || !data.link) throw new Error(`file.io upload failed: ${JSON.stringify(data)}`);
  return data.link;
}

async function uploadCatbox(localPath) {
  const buffer = await readFile(localPath);
  const blob = new Blob([buffer]);
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  if (process.env.CATBOX_USERHASH) form.append('userhash', process.env.CATBOX_USERHASH);
  form.append('fileToUpload', blob, basename(localPath));
  const res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form });
  if (!res.ok) throw new Error(`catbox upload failed: ${res.status} ${await res.text()}`);
  const url = (await res.text()).trim();
  if (!url.startsWith('http')) throw new Error(`Unexpected catbox response: ${url}`);
  return url;
}

export async function uploadToTempHost(localPath) {
  const hosts = [
    ['uguu.se', uploadUguu],
    ['file.io', uploadFileIO],
    ['catbox.moe', uploadCatbox],
  ];
  let lastErr;
  for (const [name, fn] of hosts) {
    try {
      return await fn(localPath);
    } catch (err) {
      console.warn(`[upload] ${name} failed: ${err.message.slice(0, 120)}`);
      lastErr = err;
    }
  }
  throw new Error(`All temp hosts failed. Last: ${lastErr?.message ?? 'unknown'}`);
}
