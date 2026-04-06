import { NextRequest, NextResponse } from "next/server";
import { getDownloadStream, getFileMetadata } from "@/lib/google-drive";

export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get("id");
  if (!fileId) {
    return NextResponse.json({ error: "Missing file ID" }, { status: 400 });
  }

  try {
    const metadata = await getFileMetadata(fileId);
    const stream = await getDownloadStream(fileId);

    // Convert Node.js readable stream to web ReadableStream
    const webStream = new ReadableStream({
      start(controller) {
        (stream as NodeJS.ReadableStream).on("data", (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        (stream as NodeJS.ReadableStream).on("end", () => {
          controller.close();
        });
        (stream as NodeJS.ReadableStream).on("error", (err: Error) => {
          controller.error(err);
        });
      },
    });

    return new Response(webStream, {
      headers: {
        "Content-Type": metadata.mimeType || "video/mp4",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(metadata.name || "video.mp4")}"`,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
