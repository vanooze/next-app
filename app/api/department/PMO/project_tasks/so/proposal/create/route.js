import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";
import { executeQuery } from "@/app/lib/db";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    const formData = await req.formData();

    const projectId = formData.get("projectId");
    const projectName = formData.get("projectName");
    const assignedPo = formData.get("assignedPersonnel");
    const description = formData.get("description");
    const status = formData.get("status");
    const attachDate = formData.get("attachDate");
    const file = formData.get("file");

    if (!projectId || !projectName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let filename = null;
    let fileType = null;

    if (
      file &&
      typeof file === "object" &&
      "arrayBuffer" in file &&
      file.size > 0
    ) {
      const buffer = Buffer.from(await file.arrayBuffer());
      fileType = file.type;
      const sanitizedProjectName = String(projectName)
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_\-]/gi, "");

      const dirPath = path.join(
        process.cwd(),
        "public",
        "uploads",
        sanitizedProjectName
      );
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      const originalName = path.basename(file.name);
      filename = `${Date.now()}-${originalName}`;
      const savePath = path.join(dirPath, filename);
      fs.writeFileSync(savePath, buffer);
    }

    await executeQuery(
      `INSERT INTO proposal (
        project_id, project_name, assigned_personnel, description, 
        attachment_name, attachment_type, date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        projectName,
        assignedPo || null,
        description || null,
        filename,
        fileType,
        attachDate || null,
        status || null,
      ]
    );

    return NextResponse.json({
      success: true,
      file,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }
}
