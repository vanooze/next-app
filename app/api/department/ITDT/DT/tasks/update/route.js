import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department || !user.department.includes("Design")) {
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
      eboq,
      eboqdate,
      sboq,
      sboqdate,
      sirME,
      sirMJH,
      status,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Task ID is required for update" },
        { status: 400 }
      );
    }

    const query = `
      UPDATE design_activity SET
        client_name = ?,
        proj_desc = ?,
        date_received = ?,
        sales_personnel = ?,
        eboq = ?,
        eboq_date = ?,
        sboq = ?,
        sboq_date = ?,
        sir_me = ?,
        sir_mjh = ?,
        status = ?
      WHERE id = ?
    `;

    const result = await executeQuery(query, [
      clientName,
      projectDesc,
      dateReceived,
      salesPersonnel,
      eboq,
      eboqdate,
      sboq,
      sboqdate,
      sirME,
      sirMJH,
      status,
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
