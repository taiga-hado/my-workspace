import { NextRequest, NextResponse } from "next/server";
import { chatSearch } from "@/lib/claude";
import { getAllVideos } from "@/lib/db";

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({
      message: "AI検索を利用するにはGemini APIキーの設定が必要です。.env.localにGEMINI_API_KEYを設定してください。\nhttps://aistudio.google.com/apikey からAPIキーを取得できます。",
      videos: [],
    });
  }

  try {
    const { message } = await request.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const videos = getAllVideos();
    const result = await chatSearch(message, videos);

    const matchedVideos = videos.filter((v) =>
      result.matchedVideoIds.includes(v.id)
    );

    return NextResponse.json({
      message: result.message,
      videos: matchedVideos,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("429") || msg.includes("quota")) {
      return NextResponse.json({
        message: "APIクォータの上限に達しました。しばらく待ってから再試行してください。",
        videos: [],
      });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
