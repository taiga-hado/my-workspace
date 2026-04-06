import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import type { Video } from "./types";

// Try multiple candidate paths to find/create the data file
function getDbPath(): string {
  const candidates = [
    path.join(process.cwd(), "data", "videos.json"),
    path.join(process.cwd(), "video-asset-manager", "data", "videos.json"),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  // Default: ensure the first candidate's directory exists
  const dir = path.dirname(candidates[0]);
  if (!existsSync(dir)) {
    const { mkdirSync } = require("fs");
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(candidates[0], "[]", "utf-8");
  return candidates[0];
}

let _dbPath: string | null = null;
function dbPath(): string {
  if (!_dbPath) _dbPath = getDbPath();
  return _dbPath;
}

export function getAllVideos(): Video[] {
  const raw = readFileSync(dbPath(), "utf-8");
  const videos: Video[] = JSON.parse(raw);
  // Filter out videos without thumbnails (deleted or unavailable)
  return videos.filter((v) => v.thumbnailUrl && v.thumbnailUrl !== "" && v.thumbnailUrl !== "/thumbnails/placeholder.svg");
}

export function getVideoById(id: string): Video | undefined {
  return getAllVideos().find((v) => v.id === id);
}

export function searchVideos(
  query: string,
  category?: string,
  model?: string,
  tags?: string[]
): Video[] {
  let videos = getAllVideos();

  if (category) {
    videos = videos.filter((v) => v.category === category);
  }

  if (model) {
    videos = videos.filter((v) => v.model === model);
  }

  if (tags && tags.length > 0) {
    videos = videos.filter((v) => tags.some((t) => v.tags.includes(t)));
  }

  if (query) {
    const q = query.toLowerCase();
    videos = videos.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q)) ||
        v.category.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q)
    );
  }

  return videos;
}

export function upsertVideo(video: Video): void {
  const videos = getAllVideos();
  const idx = videos.findIndex((v) => v.id === video.id);
  if (idx >= 0) {
    videos[idx] = video;
  } else {
    videos.push(video);
  }
  writeFileSync(dbPath(), JSON.stringify(videos, null, 2), "utf-8");
}

export function bulkUpsertVideos(newVideos: Video[]): void {
  const videos = getAllVideos();
  const existingMap = new Map(videos.map((v) => [v.id, v]));
  for (const v of newVideos) {
    existingMap.set(v.id, v);
  }
  writeFileSync(
    dbPath(),
    JSON.stringify([...existingMap.values()], null, 2),
    "utf-8"
  );
}

export function getCategories(): string[] {
  const videos = getAllVideos();
  return [...new Set(videos.map((v) => v.category).filter(Boolean))].sort();
}

export function getModels(): string[] {
  const videos = getAllVideos();
  return [...new Set(videos.map((v) => v.model).filter(Boolean))].sort();
}

export function getAllTags(): string[] {
  const videos = getAllVideos();
  return [...new Set(videos.flatMap((v) => v.tags))].sort();
}
