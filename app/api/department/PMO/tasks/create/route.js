import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";
import { date } from "yup";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department || !user.department.includes("PMO")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const {
      clientName,
      taskDesc,
      dateStart,
      dateEnd,
      personnel,
      dateFinished,
      status,
    } = body;

    const query = `INSERT INTO pmo_activity
    (client_name,
    task_desc,
    date_start,
    date_end,
    personnel,
    date_finished,
    status)
    VALUES
    (?,?,?,?,?,?,?)`;

    const result = await executeQuery(query, [
      clientName,
      taskDesc,
      dateStart,
      dateEnd,
      personnel,
      dateFinished,
      status,
    ]);

    return NextResponse.json({ success: true, insertId: result.insertId });
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
