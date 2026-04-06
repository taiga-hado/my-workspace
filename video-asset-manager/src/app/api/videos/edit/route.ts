import { NextRequest, NextResponse } from "next/server";
import { getAllVideos, upsertVideo } from "@/lib/db";
import { VALID_CATEGORIES } from "@/lib/types";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, tags, category, model } = body;

    if (!id) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
    }

    const videos = getAllVideos();
    const video = videos.find((v) => v.id === id);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Update only provided fields
    if (name !== undefined) video.name = name;
    if (description !== undefined) video.description = description;
    if (tags !== undefined) video.tags = tags;
    if (category !== undefined) {
      if (!VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }
      video.category = category;
    }
    if (model !== undefined) video.model = model;

    upsertVideo(video);

    return NextResponse.json({ video });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
