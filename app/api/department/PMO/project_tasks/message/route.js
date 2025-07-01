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
    const taskId = searchParams.get("taskId");

    const query = `
      SELECT
        task_key,
        user_key,
        message,
        status,
        date
      FROM task_reply
      ${taskId ? "WHERE task_key = ?" : ""}
    `;

    const rows = await executeQuery(query, taskId ? [taskId] : []);

    const reply = rows.map((r) => ({
      taskKey: r.task_key,
      userKey: r.user_key,
      message: r.message,
      status: r.status,
      date: r.date,
    }));

    return NextResponse.json(reply);
  } catch (error) {
    console.error("API Error: ", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
