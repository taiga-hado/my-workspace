import {
  getAllVideoFilesRecursive,
  listSubfolders,
  listVideoFilesInFolder,
  getThumbnailBase64,
  renameFile,
} from "./google-drive";
import { analyzeVideoThumbnail } from "./claude";
import { getAllVideos, bulkUpsertVideos } from "./db";
import type { Video, SyncResult } from "./types";

/**
 * Scan the "model" folder structure:
 *   Root > モデル名フォルダ > 動画ファイル
 * Each subfolder name = model name (e.g. "hana（モデル）")
 */
async function scanModelFolder(folderId: string): Promise<Video[]> {
  const videos: Video[] = [];
  const modelFolders = await listSubfolders(folderId);

  for (const modelFolder of modelFolders) {
    const modelName = modelFolder.name.replace(/[（(]モデル[)）]/g, "").trim();
    const files = await listVideoFilesInFolder(modelFolder.id);

    // Also check subfolders within model folders
    const subFolders = await listSubfolders(modelFolder.id);
    for (const sub of subFolders) {
      const subFiles = await listVideoFilesInFolder(sub.id);
      files.push(...subFiles);
    }

    for (const file of files) {
      if (!file.id || !file.name) continue;
      videos.push({
        id: file.id,
        originalName: file.name,
        name: file.name.replace(/\.[^.]+$/, ""),
        description: "",
        tags: [],
        category: "",
        model: modelName,
        source: "model",
        thumbnailUrl: file.thumbnailLink || "",
        driveUrl:
          file.webViewLink ||
          `https://drive.google.com/file/d/${file.id}/view`,
        mimeType: file.mimeType || "video/mp4",
        size: parseInt(file.size || "0", 10),
        createdAt: file.createdTime || new Date().toISOString(),
        processedAt: new Date().toISOString(),
      });
    }
  }
  return videos;
}

/**
 * Scan the "category" folder structure:
 *   Root > カテゴリフォルダ > 動画ファイル
 * Each subfolder name = category (e.g. "カフェ・グルメ")
 */
async function scanCategoryFolder(folderId: string): Promise<Video[]> {
  const videos: Video[] = [];
  const categoryFolders = await listSubfolders(folderId);

  for (const catFolder of categoryFolders) {
    const files = await listVideoFilesInFolder(catFolder.id);

    // Also check subfolders
    const subFolders = await listSubfolders(catFolder.id);
    for (const sub of subFolders) {
      const subFiles = await listVideoFilesInFolder(sub.id);
      files.push(...subFiles);
    }

    for (const file of files) {
      if (!file.id || !file.name) continue;
      videos.push({
        id: file.id,
        originalName: file.name,
        name: file.name.replace(/\.[^.]+$/, ""),
        description: "",
        tags: [catFolder.name],
        category: catFolder.name,
        model: "",
        source: "category",
        thumbnailUrl: file.thumbnailLink || "",
        driveUrl:
          file.webViewLink ||
          `https://drive.google.com/file/d/${file.id}/view`,
        mimeType: file.mimeType || "video/mp4",
        size: parseInt(file.size || "0", 10),
        createdAt: file.createdTime || new Date().toISOString(),
        processedAt: new Date().toISOString(),
      });
    }
  }
  return videos;
}

/**
 * Merge videos from both sources.
 * If the same file ID appears in both model and category folders,
 * merge the metadata (model from source 1, category from source 2).
 */
function mergeVideos(modelVideos: Video[], categoryVideos: Video[]): Video[] {
  const merged = new Map<string, Video>();

  for (const v of modelVideos) {
    merged.set(v.id, v);
  }

  for (const v of categoryVideos) {
    const existing = merged.get(v.id);
    if (existing) {
      // Same file in both folders — merge model + category
      existing.category = v.category;
      existing.tags = [...new Set([...existing.tags, ...v.tags])];
      existing.source = "model"; // Keep model as primary
    } else {
      merged.set(v.id, v);
    }
  }

  return [...merged.values()];
}

/**
 * Process new videos with AI analysis.
 * Only analyzes videos that haven't been processed yet.
 */
export async function processNewVideos(
  modelFolderId: string,
  categoryFolderId: string
): Promise<SyncResult> {
  const result: SyncResult = { processed: 0, skipped: 0, errors: [] };

  // Scan both folder structures
  const [modelVideos, categoryVideos] = await Promise.all([
    scanModelFolder(modelFolderId),
    scanCategoryFolder(categoryFolderId),
  ]);

  const allNew = mergeVideos(modelVideos, categoryVideos);
  const existing = getAllVideos();
  const existingIds = new Set(existing.map((v) => v.id));

  const toProcess: Video[] = [];

  for (const video of allNew) {
    if (existingIds.has(video.id)) {
      result.skipped++;
      continue;
    }

    // Try AI analysis for name/description/tags
    try {
      const thumbnail = await getThumbnailBase64(video.id);
      if (thumbnail) {
        const analysis = await analyzeVideoThumbnail(
          thumbnail,
          video.originalName
        );
        video.name = analysis.name;
        video.description = analysis.description;
        video.tags = [
          ...new Set([...video.tags, ...analysis.tags]),
        ];
        // Keep existing category from folder structure if available
        if (!video.category) {
          video.category = analysis.category;
        }

        // Rename file on Drive
        const ext = video.originalName.match(/\.[^.]+$/)?.[0] || ".mp4";
        await renameFile(video.id, `${analysis.name}${ext}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`AI analysis failed for ${video.originalName}: ${msg}`);
      // Still save with original filename
    }

    toProcess.push(video);
    result.processed++;
  }

  if (toProcess.length > 0) {
    bulkUpsertVideos(toProcess);
  }

  return result;
}

/**
 * Quick sync — just scan folders and save metadata without AI analysis.
 * Useful for initial import or when AI quota is a concern.
 */
export async function quickSync(
  modelFolderId: string,
  categoryFolderId: string
): Promise<SyncResult> {
  const result: SyncResult = { processed: 0, skipped: 0, errors: [] };

  try {
    const [modelVideos, categoryVideos] = await Promise.all([
      scanModelFolder(modelFolderId),
      scanCategoryFolder(categoryFolderId),
    ]);

    const allNew = mergeVideos(modelVideos, categoryVideos);
    const existing = getAllVideos();
    const existingIds = new Set(existing.map((v) => v.id));

    const toAdd = allNew.filter((v) => !existingIds.has(v.id));
    result.processed = toAdd.length;
    result.skipped = allNew.length - toAdd.length;

    if (toAdd.length > 0) {
      bulkUpsertVideos(toAdd);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    result.errors.push(msg);
  }

  return result;
}
