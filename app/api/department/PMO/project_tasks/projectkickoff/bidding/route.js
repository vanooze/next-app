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
        id,
        project_id,
        link_token,
        start_date,
        end_date,
        attachment_name,
        attachment_type,
        created_at,
        status,
        type
      FROM contract
      ${id ? "WHERE project_Id = ? " : ""}
    `,
      id ? [id] : []
    );

    const tasks = rows.map((r) => ({
      id: r.id,
      projectId: r.project_id,
      token: r.link_token,
      startDate: r.start_date,
      endDate: r.end_date,
      attachmentName: r.attachment_name,
      attachmentType: r.attachment_type,
      createdAt: r.created_at,
      type: r.type,
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
