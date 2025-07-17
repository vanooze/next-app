import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";
import { date } from "yup";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const {
      id,
      clientName,
      taskDesc,
      dateStart,
      dateEnd,
      personnel,
      dateFinished,
      status,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Task ID is required for update" },
        { status: 400 }
      );
    }

    const query = `UPDATE pmo_activity SET
    client_name = ?,
    task_desc = ?,
    date_start = ?,
    date_end = ?,
    personnel = ?, 
    date_finished = ?,
    status = ?
    WHERE id = ?`;

    const result = await executeQuery(query, [
      clientName,
      taskDesc,
      dateStart,
      dateEnd,
      personnel,
      dateFinished,
      status,
      id,
    ]);

    return NextResponse.json({
      success: true,
      affectedRows: result.affectedRows,
    });
  } catch (err) {
    console.error("Error creating task: ", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create task",
      },
      { status: 500 }
    );
  }
}
