import { NextRequest, NextResponse } from "next/server";
import { getAllVideos, upsertVideo } from "@/lib/db";
import { downloadVideoBuffer } from "@/lib/google-drive";
import { transcribeVideo } from "@/lib/claude";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const videoIds: string[] | undefined = body.videoIds;

    let videos = getAllVideos();

    if (videoIds && videoIds.length > 0) {
      videos = videos.filter((v) => videoIds.includes(v.id));
    } else {
      // Only process videos without transcripts
      videos = videos.filter((v) => !v.transcript);
    }

    // Limit batch size
    const limit = Math.min(videos.length, body.limit || 20);
    videos = videos.slice(0, limit);

    const result = { processed: 0, skipped: 0, errors: [] as string[] };

    for (const video of videos) {
      try {
        const buffer = await downloadVideoBuffer(video.id);
        const base64 = buffer.toString("base64");
        const transcript = await transcribeVideo(base64, video.mimeType);

        video.transcript = transcript;
        upsertVideo(video);
        result.processed++;

        // Rate limit
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        result.errors.push(`${video.name}: ${msg}`);
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
