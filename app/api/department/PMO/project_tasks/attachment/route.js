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

    let query = `
      SELECT
        task_key,
        user_key,
        attach_name,
        attach_type,
        status,
        date_attach,
        project_name
      FROM task_attachment
    `;
    const params = [];

    if (taskId) {
      query += ` WHERE task_key = ? AND status = "1"`;
      params.push(taskId);
    } else {
      query += ` WHERE status = "1"`;
    }

    const rows = await executeQuery(query, params);

    const reply = rows.map((r) => ({
      taskKey: r.task_key,
      userKey: r.user_key,
      attachName: r.attach_name,
      attachType: r.attach_type,
      status: r.status,
      dateAttach: r.date_attach,
      projectName: r.project_name,
    }));

    return NextResponse.json(reply);
  } catch (error) {
    console.error("API Error: ", error);
    return NextResponse.json(
      { error: "Failed to fetch attachments" },
      { status: 500 }
    );
  }
}
