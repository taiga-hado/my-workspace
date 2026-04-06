import { NextRequest, NextResponse } from "next/server";
import { processNewVideos, quickSync } from "@/lib/video-processor";

export async function POST(request: NextRequest) {
  const modelFolderId = process.env.GOOGLE_DRIVE_MODEL_FOLDER_ID;
  const categoryFolderId = process.env.GOOGLE_DRIVE_CATEGORY_FOLDER_ID;

  if (!modelFolderId || !categoryFolderId) {
    return NextResponse.json(
      { error: "GOOGLE_DRIVE_MODEL_FOLDER_ID and GOOGLE_DRIVE_CATEGORY_FOLDER_ID are required" },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = request.nextUrl;
    const mode = searchParams.get("mode") || "quick";

    const result =
      mode === "ai"
        ? await processNewVideos(modelFolderId, categoryFolderId)
        : await quickSync(modelFolderId, categoryFolderId);

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
