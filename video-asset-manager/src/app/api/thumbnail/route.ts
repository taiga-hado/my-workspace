import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

function getAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      // Handle both escaped \\n and actual newlines
      private_key: privateKey?.includes("\\n")
        ? privateKey.replace(/\\n/g, "\n")
        : privateKey,
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

    // Google Drive thumbnail links are publicly accessible with the token in the URL
    const res = await fetch(thumbnailUrl);
    if (!res.ok) {
      // Try with auth token
      const client = await getAuth().getClient();
      const token = await client.getAccessToken();
      const authRes = await fetch(thumbnailUrl, {
        headers: { Authorization: `Bearer ${token.token}` },
      });
      if (!authRes.ok) {
        return NextResponse.redirect(new URL("/thumbnails/placeholder.svg", request.url));
      }
      const buffer = await authRes.arrayBuffer();
      return new Response(buffer, {
        headers: {
          "Content-Type": authRes.headers.get("Content-Type") || "image/jpeg",
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
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Return error as JSON for debugging (remove in production)
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
