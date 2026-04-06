import { NextRequest, NextResponse } from "next/server";
import { analyzeAdScript } from "@/lib/claude";
import { getAllVideos } from "@/lib/db";

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEYが設定されていません" },
      { status: 500 }
    );
  }

  try {
    const { script } = await request.json();
    if (!script || typeof script !== "string") {
      return NextResponse.json(
        { error: "台本テキストが必要です" },
        { status: 400 }
      );
    }

    const videos = getAllVideos();
    const result = await analyzeAdScript(script, videos);

    // Resolve video IDs to full Video objects for each section
    const sections = result.sections.map((section) => ({
      ...section,
      videos: videos.filter((v) =>
        section.recommendedVideoIds.includes(v.id)
      ),
    }));

    return NextResponse.json({
      sections,
      summary: result.summary,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
