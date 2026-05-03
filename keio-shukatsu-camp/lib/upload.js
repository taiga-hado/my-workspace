import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

async function uploadFileIO(localPath) {
  const buffer = await readFile(localPath);
  const blob = new Blob([buffer]);
  const form = new FormData();
  form.append('file', blob, basename(localPath));
  const res = await fetch('https://file.io/?expires=1d', {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`file.io upload failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
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
  try {
    return await uploadFileIO(localPath);
  } catch (err) {
    console.warn(`[upload] file.io failed (${err.message}), falling back to catbox.moe`);
    return await uploadCatbox(localPath);
  }
}
