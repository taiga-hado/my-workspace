import { NextResponse } from "next/server";
import { getAllVideos, bulkUpsertVideos } from "@/lib/db";
import { reclassifyCategory } from "@/lib/claude";

export async function POST() {
  try {
    const videos = getAllVideos();
    const others = videos.filter((v) => v.category === "その他" || !v.category);

    if (others.length === 0) {
      return NextResponse.json({ total: 0, reclassified: 0, errors: [] });
    }

    const errors: string[] = [];
    let reclassified = 0;

    // Process in batches of 5 with delay
    for (let i = 0; i < others.length; i += 5) {
      const batch = others.slice(i, i + 5);
      const results = await Promise.allSettled(
        batch.map(async (video) => {
          const newCategory = await reclassifyCategory(video);
          video.category = newCategory;
          return video;
        })
      );

      for (const r of results) {
        if (r.status === "fulfilled") {
          reclassified++;
        } else {
          errors.push(r.reason?.message || "Unknown error");
        }
      }

      // Rate limit: wait 1s between batches
      if (i + 5 < others.length) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    bulkUpsertVideos(others);

    return NextResponse.json({
      total: others.length,
      reclassified,
      errors,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
