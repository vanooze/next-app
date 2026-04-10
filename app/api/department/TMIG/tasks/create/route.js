import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";
import { getConnection } from "@/app/lib/db";
import fs from "fs/promises";
import path from "path";

export async function POST(req) {
  const connection = await getConnection();

  try {
    const user = await getUserFromToken(req);

    if (!user || !user.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 },
      );
    }

    const formData = await req.formData();
    const clientName = formData.get("clientName");
    const description = formData.get("description");
    const date = formData.get("date");
    const status = formData.get("status");
    const personnel = formData.get("personnel");
    const unit = formData.get("unit");
    const severity = formData.get("severity");
    const completion = formData.get("completion");
    const dateCreated = formData.get("dateCreated");
    const createdBy = formData.get("createdBy");
    const files = formData.getAll("files");

    // ===============================
    // FILE UPLOAD CONFIG
    // ===============================
    /*
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
*/
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const savedFiles = [];
    const dirPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "Repair Reports",
    );
    await fs.mkdir(dirPath, { recursive: true });

    for (const file of files) {
      if (!(file instanceof Blob) || file.size === 0) continue;

      /*
      if (file.size > MAX_SIZE) {
        throw new Error("File exceeds 10MB limit");
      }
      */

      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error("Invalid file type uploaded");
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      const ext = path.extname(file.name);
      const base = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, ""); // sanitize filename

      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");

      let filename = `${base}-${todayStr}${ext}`;
      let version = 1;

      while (true) {
        try {
          await fs.access(path.join(dirPath, filename));
          filename = `${base}-${todayStr}-v${version}${ext}`;
          version++;
        } catch {
          break;
        }
      }

      await fs.writeFile(path.join(dirPath, filename), buffer);
      savedFiles.push(filename);
    }

    const attachmentName = savedFiles.length ? savedFiles.join(", ") : null;

    // ===============================
    // DB TRANSACTION
    // ===============================
    await connection.beginTransaction();

    const [insertResult] = await connection.query(
      `
      INSERT INTO repair_activity 
      (client_name, 
      description, 
      date, 
      status, 
      assigned_personnel, 
      unit, 
      severity, 
      completion, 
      date_created, 
      created_by, 
      file)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        clientName,
        description,
        date,
        status,
        personnel,
        unit,
        severity,
        completion,
        dateCreated,
        createdBy,
        attachmentName,
      ],
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: "Task created successfully and files uploaded",
      projectId: insertResult.insertId,
      files: savedFiles,
    });
  } catch (err) {
    console.error("🔥 Error creating task:", err);

    if (connection) await connection.rollback();

    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
