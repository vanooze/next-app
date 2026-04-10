import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";
import { getConnection } from "@/app/lib/db";

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

    const clientId = formData.get("clientId");
    const projectDesc = formData.get("projectDesc");
    const dateReceived = formData.get("dateReceived");
    const salesPersonnel = formData.get("salesPersonnel");
    const requestDepartment = formData.get("requestDepartment");
    const status = formData.get("status");
    const name = formData.get("name");

    const files = formData.getAll("files");

    await connection.beginTransaction();

    // OPTIONAL: save files logic placeholder
    const savedFiles = [];

    const attachmentName = savedFiles.length > 0 ? savedFiles.join(", ") : null;

    const [insertResult] = await connection.query(
      `
      INSERT INTO sales_management 
      (client_id, proj_desc, department, date_received, sales_personnel, status, created_by, profiting_file)
      VALUES (?, ?, ?, ?, ?, 'On Going', ?, ?)
      `,
      [
        clientId,
        projectDesc,
        requestDepartment,
        dateReceived,
        salesPersonnel,
        name,
        attachmentName,
      ],
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: "Task created successfully",
      salesId: insertResult.insertId,
      files: savedFiles,
    });
  } catch (err) {
    console.error("🔥 Error inserting task:", err);

    if (connection) await connection.rollback();

    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
