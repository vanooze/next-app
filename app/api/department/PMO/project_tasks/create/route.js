import { executeQuery } from "@/app/lib/eform";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department || !user.department.includes("PMO")) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const {
      soID,
      taskTodo,
      dateFilled,
      dateStart,
      dateEnd,
      notes,
      type,
      status,
      pmoOfficer,
      donePending,
      doneDate,
      positionOrder,
    } = body;

    const query = `INSERT INTO project_task(
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
    done_date,
    position_order)
    VALUES
    (?,?,?,?,?,?,?,?,?,?,?,)`;

    const result = await executeQuery(query, [
      soID,
      taskTodo,
      dateFilled,
      dateStart,
      dateEnd,
      notes,
      type,
      status,
      pmoOfficer,
      donePending,
      doneDate,
      positionOrder,
    ]);

    return NextResponse.json({ success: true, soId: result.soId });
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
