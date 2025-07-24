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

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const rows = await executeQuery(
      `
      SELECT
        project_id,
        assigned_personnel,
        description,      
        attachment_name,
        attachment_type,
        date,
        status
      FROM project_turn_over
      WHERE status = "1"
      ${id ? "AND project_Id = ?" : ""}
    `,
      id ? [id] : []
    );

    const tasks = rows.map((r) => ({
      projectId: r.project_id,
      assignedPersonnel: r.assigned_personnel,
      description: r.description,
      attachmentName: r.attachment_name,
      attachmentType: r.attachment_type,
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
