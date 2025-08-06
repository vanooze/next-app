import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }
    const body = await req.json();

    const {
      id,
      clientName,
      projectDesc,
      dateReceived,
      salesPersonnel,
      sirMJH,
      status,
      notes,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Task ID is required for update" },
        { status: 400 }
      );
    }

    const query = `
      UPDATE sales_management SET
        client_name = ?,
        proj_desc = ?,
        date_received = ?,
        sales_personnel = ?,
        sir_mjh = ?,
        status = ?,
        notes =? 
      WHERE id = ?
    `;

    const result = await executeQuery(query, [
      clientName,
      projectDesc,
      dateReceived,
      salesPersonnel,
      sirMJH,
      status,
      notes,
      id,
    ]);

    return NextResponse.json({
      success: true,
      affectedRows: result.affectedRows,
    });
  } catch (err) {
    console.error("Error updating task: ", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update task",
      },
      { status: 500 }
    );
  }
}
