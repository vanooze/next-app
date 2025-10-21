import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    const formData = await req.formData();

    const projectId = formData.get("project_id");
    const date = formData.get("date");
    const timeIn = formData.get("time_in");
    const timeOut = formData.get("time_out");
    const category = formData.get("category");
    const activity = formData.get("activity");
    const concern = formData.get("concern");
    const actionTaken = formData.get("action_taken");
    const remarks = formData.get("remarks");
    const personnel = formData.get("personnel");
    const file = formData.get("file");

    if (!projectId || !date || !category) {
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

      const dirPath = path.join(
        process.cwd(),
        "public",
        "uploads",
        "reports",
        projectId
      );
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

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

    let user = null;
    try {
      user = await getUserFromToken(req);
    } catch {}

    await executeQuery(
      `INSERT INTO reporting (
        project_id, date, time_in, time_out,
        category, activity, concern, action_taken, remarks, personnel,
        attachment_name, attachment_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        date,
        timeIn || null,
        timeOut || null,
        category,
        activity || null,
        concern || null,
        actionTaken || null,
        remarks || null,
        personnel || null,
        filename,
        fileType,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Report creation error:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
