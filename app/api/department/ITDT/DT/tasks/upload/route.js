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
        { status: 403 }
      );
    }
    const formData = await req.formData();
    const file = formData.get("file");
    const taskId = formData.get("taskId");

    if (!(file instanceof Blob) || !taskId) {
      return NextResponse.json(
        { success: false, error: "File and taskId are required" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public/uploads/profitting");
    await fs.mkdir(uploadDir, { recursive: true });
    const originalName = file.name || "uploaded_file";
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);

    const dateSuffix = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    let fileName = `${baseName}-${dateSuffix}${ext}`;
    let counter = 1;

    while (true) {
      try {
        await fs.access(path.join(uploadDir, fileName));
        counter++;
        fileName = `${baseName}-${dateSuffix}-v${counter}${ext}`;
      } catch {
        break;
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadDir, fileName), buffer);
    const now = new Date();
    const formattedDate = now.toISOString().split("T")[0];

    const query = `
      UPDATE design_activity
      SET profiting_file = ?, sir_mjh = ?, status = ?
      WHERE id = ?
    `;
    await executeQuery(query, [fileName, formattedDate, "Finished", taskId]);

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      attachment_name: fileName,
      upload_date: formattedDate,
      path: `/uploads/profitting/${fileName}`,
    });
  } catch (err) {
    console.error("Error uploading file:", err);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
