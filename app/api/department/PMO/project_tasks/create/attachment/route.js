import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/eform";
import { getUserFromToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await req.formData();

    const taskKey = formData.get("taskKey")?.toString();
    const userKey = formData.get("userKey")?.toString();
    const status = formData.get("status")?.toString();
    const attachDate = formData.get("attachDate")?.toString();
    const projectName = formData.get("projectName")?.toString();
    const file = formData.get("file");

    if (!file || !file.name || !projectName) {
      return NextResponse.json(
        { error: "Missing file or project name" },
        { status: 400 }
      );
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      projectName
    );
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, file.name);
    await writeFile(filePath, buffer);

    await executeQuery(
      `INSERT INTO task_attachment (task_key, user_key, attach_name, attach_type, status, date_attach, project_name)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [taskKey, userKey, file.name, file.type, status, attachDate, projectName]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
