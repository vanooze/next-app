import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";
import { getConnection } from "@/app/lib/db";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const connection = await getConnection();

  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const description = formData.get("description");
    const department = formData.get("department");
    const assignedPersonnel = formData.get("assignedPersonnel");
    const requestedBy = formData.get("requestedBy");
    const requestedDate = formData.get("requestedDate");
    const requestedNote = formData.get("requestedNote");
    const status = formData.get("status");
    const files = formData.getAll("files");

    if (!description || !description.trim()) {
      return NextResponse.json(
        { success: false, error: "Description is required" },
        { status: 400 },
      );
    }

    if (!department || !department.trim()) {
      return NextResponse.json(
        { success: false, error: "Department is required" },
        { status: 400 },
      );
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

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

      // avoid overwrite
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

    await connection.beginTransaction();

    const [result] = await connection.query(
      `
      INSERT INTO ticketing
      (description, department, assigned_personnel, requested_by, requested_date, requested_note, status, requested_file)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        description,
        department,
        assignedPersonnel,
        requestedBy,
        requestedDate,
        requestedNote,
        status,
        attachmentNames,
      ],
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: "Ticket created successfully",
      ticketId: result.insertId,
      files: savedFiles,
    });
  } catch (err) {
    console.error("🔥 Error creating ticket:", err);

    if (connection) await connection.rollback();

    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
