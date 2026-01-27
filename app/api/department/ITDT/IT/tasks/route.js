import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);
    // if (!user || !user.department) {
    //   return NextResponse.json(
    //     { error: "Unauthorized access" },
    //     { status: 403 }
    //   );
    // }
    const rows = await executeQuery(
      "SELECT * FROM it_activity WHERE deleted = 0",
    );
    const tasks = rows.map((r) => ({
      id: r.id,
      project: r.project,
      projectDesc: r.project_desc,
      tasks: r.tasks,
      personnel: r.personnel,
      dateStart: r.date_start,
      dateEnd: r.date_end,
      attachmentName: r.attachment_name,
      status: r.status,
    }));
    return Response.json(tasks);
  } catch (error) {
    console.error("API Error: ", error);
    return Response.json({ error: "Failed to fetch table" }, { status: 500 });
  }
}
