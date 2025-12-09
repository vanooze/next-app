import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const projectId = formData.get("projectId");
    const uploader = formData.get("uploader");
    const description = formData.get("description");
    const status = formData.get("status");
    const attachDate = formData.get("attachDate");
    const file = formData.get("file");

    // ✅ initialize filename and fileType with safe defaults
    let filename = null;
    let fileType = null;

    if (
      file &&
      typeof file === "object" &&
      "arrayBuffer" in file &&
      file.size > 0
    ) {
      const buffer = Buffer.from(await file.arrayBuffer());
      fileType = file.type || "application/octet-stream"; // fallback if missing

      const dirPath = path.join(
        process.cwd(),
        "public",
        "uploads",
        projectId,
        "sales_order"
      );

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const ext = path.extname(file.name);
      const base = path.basename(file.name, ext);
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");

      filename = `${base}-${todayStr}${ext}`;

      // ✅ Handle versioning if filename already exists
      let version = 1;
      while (fs.existsSync(path.join(dirPath, filename))) {
        filename = `${base}-${todayStr}-v${version}${ext}`;
        version++;
      }

      const savePath = path.join(dirPath, filename);
      fs.writeFileSync(savePath, buffer);
    }

    // ✅ store file metadata in DB (even if no file was uploaded successfully)
    await executeQuery(
      `
      INSERT INTO project_turn_over (
        project_id, uploader, description,
        attachment_name, attachment_type, date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        projectId,
        uploader || null,
        description || null,
        filename || null,
        fileType || null,
        attachDate || null,
        status || null,
      ]
    );

    return NextResponse.json({
      success: true,
      file: filename,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }
}
