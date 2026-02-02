import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 },
      );
    }
    const body = await req.json();

    const { id, personnel, date, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Task ID is required for update" },
        { status: 400 },
      );
    }

    const query = `
      UPDATE it_activity SET
        personnel = ?,
        date= ?,
        status = ?
      WHERE id = ?
    `;

    const result = await executeQuery(query, [personnel, date, status, id]);

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
      { status: 500 },
    );
  }
}
