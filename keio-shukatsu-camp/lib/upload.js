import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

export async function uploadToTempHost(localPath) {
  const buffer = await readFile(localPath);
  const blob = new Blob([buffer]);
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', blob, basename(localPath));
  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status} ${await res.text()}`);
  const url = (await res.text()).trim();
  if (!url.startsWith('http')) throw new Error(`Unexpected response: ${url}`);
  return url;
}
