import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import fs from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const id = formData.get("id");
    const finishedDate = formData.get("finishedDate");
    const finishedTime = formData.get("finishedTime");
    const files = formData.getAll("files");

    const MAX_SIZE = 10 * 1024 * 1024;

    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const uploadDir = path.join(process.cwd(), "public", "uploads", "tickets");
    await fs.mkdir(uploadDir, { recursive: true });

    const savedFiles = [];

    for (const file of files) {
      if (!(file instanceof Blob) || file.size === 0) continue;

      if (file.size > MAX_SIZE) {
        throw new Error(`File "${file.name}" exceeds 10MB limit`);
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}`);
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      const ext = path.extname(file.name);
      const base = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, "");
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");

      let filename = `${base}-${dateStr}${ext}`;
      let version = 1;

      while (true) {
        try {
          await fs.access(path.join(uploadDir, filename));
          filename = `${base}-${dateStr}-v${version}${ext}`;
          version++;
        } catch {
          break;
        }
      }

      await fs.writeFile(path.join(uploadDir, filename), buffer);
      savedFiles.push(filename);
    }

    const attachmentNames = savedFiles.length ? savedFiles.join(", ") : null;

    await executeQuery(
      `
      UPDATE ticketing
      SET 
        finished_date = ?,
        finished_time = ?,
        personnel_file = ?,
        status = 'Finished'
      WHERE id = ?
      `,
      [finishedDate, finishedTime, attachmentNames, id],
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Finish ticket error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
