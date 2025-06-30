import { executeQuery } from "@/app/lib/eform";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department || !user.department.includes("PMO")) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const soId = searchParams.get("soId");

    const query = `
      SELECT
        task_key,
        so_id,
        task_todo,
        date_filled,
        date_start,
        date_end,
        notes,
        type,
        status,
        pmo_officer,
        done_pending,
        done_date
      FROM project_task
      ${soId ? "WHERE so_id = ?" : ""}
    `;

    const rows = await executeQuery(query, soId ? [soId] : []);

    const tasks = rows.map((r) => ({
      taskKey: r.task_key,
      soId: r.so_id,
      taskTodo: r.task_todo,
      dateFilled: r.date_filled,
      dateStart: r.date_start,
      dateEnd: r.date_end,
      notes: r.notes,
      type: r.type,
      status: r.status,
      pmoOfficer: r.pmo_officer,
      donePending: r.done_pending,
      doneDate: r.done_date,
    }));

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("API Error: ", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
