import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";
import { getConnection } from "@/app/lib/db";
import fs from "fs";
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
    const salesId = formData.get("salesId");
    const clientName = formData.get("clientName");
    const projectDesc = formData.get("projectDesc");
    const dateReceived = formData.get("dateReceived");
    const salesPersonnel = formData.get("salesPersonnel");
    const status = formData.get("status");
    const name = formData.get("name");

    const files = formData.getAll("files"); // ✅ multiple files

    const savedFiles = [];
    const dirPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "ocular report",
    );
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

    // ✅ Loop through all uploaded files
    for (const file of files) {
      if (!(file instanceof Blob) || file.size === 0) continue;

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name);
      const base = path.basename(file.name, ext);
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      let filename = `${base}-${todayStr}${ext}`;
      let version = 1;
      while (fs.existsSync(path.join(dirPath, filename))) {
        filename = `${base}-${todayStr}-v${version}${ext}`;
        version++;
      }
      fs.writeFileSync(path.join(dirPath, filename), buffer);
      savedFiles.push(filename);
    }

    // Store files as comma-separated string in attachment_name
    const attachmentName = savedFiles.length > 0 ? savedFiles.join(", ") : null;
    await connection.beginTransaction();

    // Insert into DB
    const [insertResult] = await connection.query(
      `
      INSERT INTO design_activity 
      (client_name, proj_desc, date_received, sales_personnel, status, created_by, attachment_name,sales_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        clientName,
        projectDesc,
        dateReceived,
        salesPersonnel,
        status,
        name,
        attachmentName,
        salesId,
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
    console.error("🔥 Error creating Tasks:", err);
    if (connection) await connection.rollback();
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
