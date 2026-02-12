import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // ----------------- GET QUERY -----------------
    const folderId = searchParams.get("folderId"); // optional
    const fileName = decodeURIComponent(searchParams.get("file") || "");

    if (!fileName) {
      return NextResponse.json(
        { error: "Missing file parameter" },
        { status: 400 },
      );
    }

    // ----------------- BUILD FILE PATH -----------------
    const baseDir = path.join(process.cwd(), "public", "uploads", "qms");
    const dirPath = folderId ? path.join(baseDir, folderId) : baseDir;
    const safeFileName = path.basename(fileName); // prevent path traversal
    const filePath = path.join(dirPath, safeFileName);

    console.log("Folder ID:", folderId);
    console.log("File:", safeFileName);
    console.log("Looking for:", filePath);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    // ----------------- MIME TYPE -----------------
    const ext = path.extname(safeFileName).toLowerCase();
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

    // ----------------- SEND FILE -----------------
    const headers = new Headers();
    headers.set("Content-Type", mimeType);
    headers.set(
      "Content-Disposition",
      `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodeURIComponent(safeFileName)}`,
    );

    return new NextResponse(fileBuffer, { headers });
  } catch (err) {
    console.error("Download error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
