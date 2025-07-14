import { executeQuery } from "@/app/lib/db";
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
    const rows = await executeQuery(`
  SELECT
    id,
    client_name,
    task_desc,
    date_start,
    date_end,
    personnel,
    date_finished,
    status
  FROM pmo_activity
`);

    const tasks = rows.map((r) => ({
      id: r.id,
      clientName: r.client_name,
      taskDesc: r.task_desc,
      dateStart: r.date_start,
      dateEnd: r.date_end,
      personnel: r.personnel,
      dateFinished: r.date_finished,
      status: r.status,
    }));
    return Response.json(tasks);
  } catch (error) {
    console.error("API Error: ", error);
    return Response.json({ error: "Failed to fetch table" }, { status: 500 });
  }
}
