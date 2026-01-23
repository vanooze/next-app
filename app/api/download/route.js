import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // ✅ Decode folder and file names to fix %2520 issues
    const folder = decodeURIComponent(searchParams.get("folder") || "");
    const file = decodeURIComponent(searchParams.get("file") || "");

    if (!file) {
      return NextResponse.json(
        { error: "Missing file parameter" },
        { status: 400 }
      );
    }

    // 🗂 Safely build path
    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      folder,
      file
    );

    // 🔍 Log for debugging
    console.log("Decoded folder:", folder);
    console.log("Decoded file:", file);
    console.log("Looking for:", filePath);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    // 🧾 Determine the MIME type
    const ext = path.extname(file).toLowerCase();
    const mimeTypes = {
      ".pdf": "application/pdf",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xls": "application/vnd.ms-excel",
      ".xlsx":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".rar": "application/x-rar-compressed",
      ".zip": "application/zip",
    };

    const mimeType = mimeTypes[ext] || "application/octet-stream";

    // 🧩 Send response as file download
    const headers = new Headers();
    headers.set("Content-Type", mimeType);
    headers.set(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(file)}"`
    );

    return new NextResponse(fileBuffer, { headers });
  } catch (err) {
    console.error("Download error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
