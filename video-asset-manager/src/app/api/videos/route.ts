import { NextRequest, NextResponse } from "next/server";
import { searchVideos, getCategories, getModels, getAllTags } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || undefined;
  const model = searchParams.get("model") || undefined;
  const tagsParam = searchParams.get("tags");
  const tags = tagsParam ? tagsParam.split(",") : undefined;

  const videos = searchVideos(query, category, model, tags).map((v) => ({
    ...v,
    // Replace Google Drive thumbnail URL with proxy URL
    thumbnailUrl: v.id ? `/api/thumbnail?id=${v.id}` : v.thumbnailUrl,
  }));

  const categories = getCategories();
  const models = getModels();
  const allTags = getAllTags();

  return NextResponse.json({ videos, categories, models, allTags });
}
