import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const rows = await executeQuery(
      `SELECT id, file_title, file_description, file_date, file_name 
       FROM qms_files 
       WHERE deleted = 0 OR deleted IS NULL
       ORDER BY file_date DESC, id DESC`
    );

    return NextResponse.json({ success: true, files: rows });
  } catch (err) {
    console.error("Error fetching QMS files:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const fileTitle = formData.get("fileTitle");
    const fileDescription = formData.get("fileDescription");
    const file = formData.get("file");

    if (!fileTitle || !file) {
      return NextResponse.json(
        { success: false, error: "File title and file are required" },
        { status: 400 }
      );
    }

    const fs = require("fs");
    const path = require("path");
    const dirPath = path.join(process.cwd(), "public", "uploads", "qms");

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    let filename = null;
    if (
      file &&
      typeof file === "object" &&
      "arrayBuffer" in file &&
      file.size > 0
    ) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name);
      const base = path.basename(file.name, ext);
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      filename = `${base}-${todayStr}${ext}`;

      let version = 1;
      while (fs.existsSync(path.join(dirPath, filename))) {
        filename = `${base}-${todayStr}-v${version}${ext}`;
        version++;
      }

      const savePath = path.join(dirPath, filename);
      fs.writeFileSync(savePath, buffer);
    }

    const fileDate = new Date().toISOString().split("T")[0];

    // ✅ executeQuery returns result directly (not destructured)
    const result = await executeQuery(
      `INSERT INTO qms_files (file_title, file_description, file_date, file_name, deleted)
       VALUES (?, ?, ?, ?, 0)`,
      [fileTitle, fileDescription || null, fileDate, filename]
    );

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      id: result.insertId || null,
    });
  } catch (err) {
    console.error("Error uploading QMS file:", err);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
