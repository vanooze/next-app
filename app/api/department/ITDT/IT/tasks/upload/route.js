import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";
import path from "path";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);

    if (!user || !user.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 },
      );
    }

    const formData = await req.formData();
    const taskId = formData.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: "taskId is required" },
        { status: 400 },
      );
    }

    const files = formData.getAll("files");
    if (!files.length) {
      return NextResponse.json(
        { success: false, error: "At least one file is required" },
        { status: 400 },
      );
    }

    // Upload folder
    const uploadDir = path.join(process.cwd(), "public/uploads/IT Reporting");
    await fs.mkdir(uploadDir, { recursive: true });

    const savedFiles = [];

    for (const file of files) {
      if (!(file instanceof Blob)) continue;

      const originalName = file.name || "uploaded_file";
      const ext = path.extname(originalName);
      const baseName = path
        .basename(originalName, ext)
        .replace(/,/g, "-")
        .replace(/["']/g, "")
        .trim();

      const dateSuffix = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "");
      let fileName = `${baseName}-${dateSuffix}${ext}`;
      let counter = 1;

      // Ensure unique filename
      while (true) {
        try {
          await fs.access(path.join(uploadDir, fileName));
          fileName = `${baseName}-${dateSuffix}-${counter}${ext}`;
          counter++;
        } catch {
          break;
        }
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(path.join(uploadDir, fileName), buffer);
      savedFiles.push(fileName);
    }

    // Get existing files
    const [existing] = await executeQuery(
      `SELECT attachment_name FROM it_activity WHERE id = ?`,
      [taskId],
    );

    let allFiles = [];
    if (existing?.attachment_name) {
      try {
        allFiles = JSON.parse(existing.attachment_name);
      } catch {
        allFiles = [];
      }
    }

    allFiles = [...allFiles, ...savedFiles];

    // Update table
    await executeQuery(
      `UPDATE it_activity SET attachment_name = ? WHERE id = ?`,
      [JSON.stringify(allFiles), taskId],
    );

    return NextResponse.json({
      success: true,
      message: "Files uploaded successfully",
      files: allFiles.map((name) => ({
        name,
        path: `/uploads/IT%20Reporting/${encodeURIComponent(name)}`,
      })),
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to upload files" },
      { status: 500 },
    );
  }
}
