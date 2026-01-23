import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";
import fs from "fs";
import path from "path";

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    // ---------------- FETCH FILES ----------------
    const files = await executeQuery(
      `SELECT id, file_title, file_description, file_date, file_name, folder_id
       FROM qms_files
       WHERE deleted = 0 OR deleted IS NULL
       ORDER BY file_date DESC, id DESC`,
    );

    // ---------------- FETCH FOLDERS ----------------
    const folders = await executeQuery(
      `SELECT id, name, parent_id, created_by, created_at,access
       FROM qms_folder
       WHERE deleted = 0 
       ORDER BY created_at ASC`,
    );

    const topLevelFolders = folders.filter(
      (f) => f.parent_id === null && f.created_by === user.name,
    );

    return NextResponse.json({
      success: true,
      files,
      folders,
      topLevelFolders,
    });
  } catch (err) {
    console.error("Error fetching QMS files:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch files" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const formData = await req.formData();

    const fileTitle = formData.get("fileTitle");
    const fileDescription = formData.get("fileDescription");
    const file = formData.get("file");
    const folderId = formData.get("folderId");

    if (!fileTitle || !file) {
      return NextResponse.json(
        { success: false, error: "File title and file are required" },
        { status: 400 },
      );
    }

    // ----------------- FILE STORAGE PATH -----------------
    const baseDir = path.join(process.cwd(), "public", "uploads", "qms");

    // Optional: store files per folder
    const dirPath = folderId ? path.join(baseDir, String(folderId)) : baseDir;

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // ----------------- SAVE FILE -----------------
    let filename = null;

    if (file && typeof file === "object" && "arrayBuffer" in file) {
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

      fs.writeFileSync(path.join(dirPath, filename), buffer);
    }

    const fileDate = new Date().toISOString().split("T")[0];

    // ----------------- DB INSERT -----------------
    const result = await executeQuery(
      `INSERT INTO qms_files 
        (file_title, file_description, file_date, file_name, folder_id, deleted)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [
        fileTitle,
        fileDescription || null,
        fileDate,
        filename,
        folderId ? Number(folderId) : null,
      ],
    );

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      id: result.insertId,
    });
  } catch (err) {
    console.error("Error uploading QMS file:", err);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
