import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
}

export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get("id");
  if (!fileId) {
    return NextResponse.json({ error: "Missing file ID" }, { status: 400 });
  }

  try {
    const drive = google.drive({ version: "v3", auth: getAuth() });
    const file = await drive.files.get({
      fileId,
      fields: "thumbnailLink",
      supportsAllDrives: true,
    });

    const thumbnailUrl = file.data.thumbnailLink;
    if (!thumbnailUrl) {
      return NextResponse.redirect(new URL("/thumbnails/placeholder.svg", request.url));
    }

    // Fetch the thumbnail with auth
    const client = await getAuth().getClient();
    const token = await client.getAccessToken();

    const res = await fetch(thumbnailUrl, {
      headers: {
        Authorization: `Bearer ${token.token}`,
      },
    });

    if (!res.ok) {
      // Try without auth (some thumbnails are public)
      const pubRes = await fetch(thumbnailUrl);
      if (!pubRes.ok) {
        return NextResponse.redirect(new URL("/thumbnails/placeholder.svg", request.url));
      }
      const buffer = await pubRes.arrayBuffer();
      return new Response(buffer, {
        headers: {
          "Content-Type": pubRes.headers.get("Content-Type") || "image/jpeg",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    const buffer = await res.arrayBuffer();
    return new Response(buffer, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.redirect(new URL("/thumbnails/placeholder.svg", request.url));
  }
}
