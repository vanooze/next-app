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
    const { id, status, notes, dateAwarded, updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Task ID is required for update" },
        { status: 400 }
      );
    }

    let updatesQueryPart = "";
    let params = [status, notes, dateAwarded];

    if (updates && updates.trim() !== "") {
      const now = new Date().toISOString().split("T")[0];

      updatesQueryPart = `,
        updates = CONCAT(
          COALESCE(updates, ''),
          CASE WHEN COALESCE(updates, '') != '' THEN '\n' ELSE '' END,
          ?
        ),
        update_dates = CONCAT(
          COALESCE(update_dates, ''),
          CASE WHEN COALESCE(update_dates, '') != '' THEN ',' ELSE '' END,
          ?
        )
      `;
      params.push(updates, now);
    }

    params.push(id);

    const query = `
      UPDATE sales_management
      SET
        status = ?,
        notes = ?,
        date_awarded = ?
        ${updatesQueryPart}
      WHERE id = ? AND deleted = 0
    `;

    const result = await executeQuery(query, params);

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
