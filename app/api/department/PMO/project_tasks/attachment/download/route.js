import { NextResponse } from "next/server";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";

// Base directory for file storage
const UPLOADS_DIR = path.resolve(process.cwd(), "public", "uploads");

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const projectName = searchParams.get("project");
    const fileName = searchParams.get("file");

    if (!projectName || !fileName) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    const filePath = path.join(UPLOADS_DIR, projectName, fileName);
    const fileStat = await stat(filePath).catch(() => null);

    if (!fileStat) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const stream = createReadStream(filePath);
    return new Response(stream, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
