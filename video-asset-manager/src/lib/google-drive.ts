import { google } from "googleapis";
import type { drive_v3 } from "googleapis";
import type { FolderInfo } from "./types";

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
}

function getDrive(): drive_v3.Drive {
  return google.drive({ version: "v3", auth: getAuth() });
}

export async function listSubfolders(folderId: string): Promise<FolderInfo[]> {
  const drive = getDrive();
  const folders: FolderInfo[] = [];
  let pageToken: string | undefined;

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "nextPageToken, files(id, name)",
      pageSize: 100,
      pageToken: pageToken || undefined,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    for (const f of res.data.files || []) {
      if (f.id && f.name) folders.push({ id: f.id, name: f.name });
    }
    pageToken = res.data.nextPageToken || undefined;
  } while (pageToken);

  return folders;
}

export async function listVideoFilesInFolder(
  folderId: string
): Promise<drive_v3.Schema$File[]> {
  const drive = getDrive();
  const allFiles: drive_v3.Schema$File[] = [];
  let pageToken: string | undefined;

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'video/' and trashed = false`,
      fields:
        "nextPageToken, files(id, name, mimeType, size, createdTime, thumbnailLink, webViewLink)",
      pageSize: 100,
      pageToken: pageToken || undefined,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    allFiles.push(...(res.data.files || []));
    pageToken = res.data.nextPageToken || undefined;
  } while (pageToken);

  return allFiles;
}

/** Recursively get all video files from a folder and its subfolders */
export async function getAllVideoFilesRecursive(
  folderId: string
): Promise<{ file: drive_v3.Schema$File; parentFolderName: string }[]> {
  const results: { file: drive_v3.Schema$File; parentFolderName: string }[] =
    [];

  // Get direct video files
  const directFiles = await listVideoFilesInFolder(folderId);
  for (const f of directFiles) {
    results.push({ file: f, parentFolderName: "" });
  }

  // Get subfolders and recurse
  const subfolders = await listSubfolders(folderId);
  for (const sub of subfolders) {
    const subFiles = await listVideoFilesInFolder(sub.id);
    for (const f of subFiles) {
      results.push({ file: f, parentFolderName: sub.name });
    }
    // Go one more level deep (subfolder of subfolder)
    const subSubfolders = await listSubfolders(sub.id);
    for (const subsub of subSubfolders) {
      const subSubFiles = await listVideoFilesInFolder(subsub.id);
      for (const f of subSubFiles) {
        results.push({ file: f, parentFolderName: `${sub.name}/${subsub.name}` });
      }
    }
  }

  return results;
}

export async function getThumbnailBase64(
  fileId: string
): Promise<string | null> {
  const drive = getDrive();
  try {
    const file = await drive.files.get({
      fileId,
      fields: "thumbnailLink",
      supportsAllDrives: true,
    });
    if (!file.data.thumbnailLink) return null;

    const response = await fetch(file.data.thumbnailLink);
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString("base64");
  } catch {
    return null;
  }
}

export async function renameFile(
  fileId: string,
  newName: string
): Promise<void> {
  const drive = getDrive();
  await drive.files.update({
    fileId,
    requestBody: { name: newName },
    supportsAllDrives: true,
  });
}

export async function moveFile(
  fileId: string,
  targetFolderId: string
): Promise<void> {
  const drive = getDrive();
  const file = await drive.files.get({ fileId, fields: "parents", supportsAllDrives: true });
  const previousParents = file.data.parents?.join(",") || "";
  await drive.files.update({
    fileId,
    addParents: targetFolderId,
    removeParents: previousParents,
    supportsAllDrives: true,
  });
}

export async function findOrCreateFolder(
  parentFolderId: string,
  folderName: string
): Promise<string> {
  const drive = getDrive();
  const existing = await drive.files.list({
    q: `'${parentFolderId}' in parents and name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  if (existing.data.files && existing.data.files.length > 0) {
    return existing.data.files[0].id!;
  }
  const created = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    },
    fields: "id",
  });
  return created.data.id!;
}

export async function getDownloadStream(fileId: string) {
  const drive = getDrive();
  const res = await drive.files.get(
    { fileId, alt: "media", supportsAllDrives: true },
    { responseType: "stream" }
  );
  return res.data;
}

export async function downloadVideoBuffer(fileId: string): Promise<Buffer> {
  const drive = getDrive();
  const res = await drive.files.get(
    { fileId, alt: "media", supportsAllDrives: true },
    { responseType: "arraybuffer" }
  );
  return Buffer.from(res.data as ArrayBuffer);
}

export async function getFileMetadata(fileId: string) {
  const drive = getDrive();
  const res = await drive.files.get({
    fileId,
    fields:
      "id, name, mimeType, size, createdTime, thumbnailLink, webViewLink",
    supportsAllDrives: true,
  });
  return res.data;
}
