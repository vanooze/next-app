import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const query = await executeQuery(`
      SELECT
       id,
       client_name,
       task_desc,
       date_received,
       personnel,
       date,
       status
       FROM pmo_activity
    `);

    const tasks = rows.map((r) => ({
      id: r.id,
      clientName: r.client_name,
      taskDesc: r.task_desc,
      dateReceived: r.date_received,
      personnel: r.personnel,
      date: r.date,
      status: r.status,
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
